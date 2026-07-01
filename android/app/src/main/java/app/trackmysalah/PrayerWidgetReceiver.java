package app.trackmysalah;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.Calendar;

public class PrayerWidgetReceiver extends BroadcastReceiver {

    public static final String ACTION_LOG_PRAYER = "app.trackmysalah.ACTION_LOG_PRAYER";
    public static final String ACTION_RESET_DAY = "app.trackmysalah.ACTION_RESET_DAY";
    private static final String PREFS_NAME = "prayer_widget_prefs";
    private static final String KEY_DATA = "widget_today";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();

        if (ACTION_LOG_PRAYER.equals(action)) {
            handleLogPrayer(context, intent);
        } else if (ACTION_RESET_DAY.equals(action) || Intent.ACTION_DATE_CHANGED.equals(action)) {
            handleDayReset(context);
        } else if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(action)) {
            // Nothing extra — provider handles this
        }
    }

    private void handleLogPrayer(Context context, Intent intent) {
        String prayerName = intent.getStringExtra("prayer_name");
        String status = intent.getStringExtra("status");

        if (prayerName == null || status == null) return;

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String json = prefs.getString(KEY_DATA, null);

        try {
            JSONObject data;
            if (json != null) {
                data = new JSONObject(json);
            } else {
                data = new JSONObject();
                data.put("date", todayString());
                data.put("prayers", new JSONObject());
            }

            JSONObject prayers = data.optJSONObject("prayers");
            if (prayers == null) {
                prayers = new JSONObject();
            }

            // Only update if not already logged
            if (!prayers.has(prayerName) || prayers.isNull(prayerName)) {
                prayers.put(prayerName, status);
                data.put("prayers", prayers);
                data.put("lastModified", System.currentTimeMillis());
                prefs.edit().putString(KEY_DATA, data.toString()).apply();
            }
        } catch (JSONException e) {
            return;
        }

        // Refresh widget
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, PrayerWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);
        if (ids.length > 0) {
            Intent updateIntent = new Intent(context, PrayerWidgetProvider.class);
            updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            context.sendBroadcast(updateIntent);
        }
    }

    private void handleDayReset(Context context) {
        String today = todayString();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String json = prefs.getString(KEY_DATA, null);

        try {
            JSONObject data;
            if (json != null) {
                data = new JSONObject(json);
                String storedDate = data.optString("date", "");
                if (storedDate.equals(today)) return; // already today
            }
        } catch (JSONException e) {
            // reset anyway
        }

        // Reset for new day
        JSONObject reset = new JSONObject();
        try {
            reset.put("date", today);
            reset.put("prayers", new JSONObject());
            reset.put("lastModified", System.currentTimeMillis());
        } catch (JSONException e) {
            return;
        }
        prefs.edit().putString(KEY_DATA, reset.toString()).apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, PrayerWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);
        if (ids.length > 0) {
            Intent updateIntent = new Intent(context, PrayerWidgetProvider.class);
            updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            context.sendBroadcast(updateIntent);
        }
    }

    public static void scheduleMidnightReset(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Calendar midnight = Calendar.getInstance();
        midnight.set(Calendar.HOUR_OF_DAY, 0);
        midnight.set(Calendar.MINUTE, 0);
        midnight.set(Calendar.SECOND, 1);
        midnight.set(Calendar.MILLISECOND, 0);
        midnight.add(Calendar.DAY_OF_MONTH, 1);

        Intent intent = new Intent(context, PrayerWidgetReceiver.class);
        intent.setAction(ACTION_RESET_DAY);
        PendingIntent pending = PendingIntent.getBroadcast(
            context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        alarmManager.setExact(AlarmManager.RTC_WAKEUP, midnight.getTimeInMillis(), pending);
    }

    private static String todayString() {
        Calendar cal = Calendar.getInstance();
        return String.format("%04d-%02d-%02d",
            cal.get(Calendar.YEAR),
            cal.get(Calendar.MONTH) + 1,
            cal.get(Calendar.DAY_OF_MONTH));
    }
}
