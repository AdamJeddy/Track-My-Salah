package app.trackmysalah;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import org.json.JSONException;
import org.json.JSONObject;

public class PrayerWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "prayer_widget_prefs";
    private static final String KEY_DATA = "widget_today";

    private static final String[] PRAYER_NAMES = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};

    // Layout IDs for each prayer row
    private static final int[] ROW_IDS = {
        R.id.row_fajr, R.id.row_dhuhr, R.id.row_asr, R.id.row_maghrib, R.id.row_isha
    };
    private static final int[] NAME_IDS = {
        R.id.name_fajr, R.id.name_dhuhr, R.id.name_asr, R.id.name_maghrib, R.id.name_isha
    };
    private static final int[] JAMAH_IDS = {
        R.id.btn_fajr_jamah, R.id.btn_dhuhr_jamah, R.id.btn_asr_jamah, R.id.btn_maghrib_jamah, R.id.btn_isha_jamah
    };
    private static final int[] PRAYED_IDS = {
        R.id.btn_fajr_prayed, R.id.btn_dhuhr_prayed, R.id.btn_asr_prayed, R.id.btn_maghrib_prayed, R.id.btn_isha_prayed
    };
    private static final int[] BADGE_IDS = {
        R.id.badge_fajr, R.id.badge_dhuhr, R.id.badge_asr, R.id.badge_maghrib, R.id.badge_isha
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String json = prefs.getString(KEY_DATA, null);

        JSONObject prayers = new JSONObject();
        if (json != null) {
            try {
                JSONObject data = new JSONObject(json);
                prayers = data.optJSONObject("prayers");
                if (prayers == null) prayers = new JSONObject();
            } catch (JSONException e) {
                // use empty
            }
        }

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget);

            // Header: open app on tap
            Intent openApp = new Intent(context, MainActivity.class);
            PendingIntent pendingOpen = PendingIntent.getActivity(
                context, 0, openApp, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_header, pendingOpen);

            // Prayer rows
            for (int i = 0; i < PRAYER_NAMES.length; i++) {
                String prayer = PRAYER_NAMES[i];
                boolean hasStatus = prayers.has(prayer) && !prayers.isNull(prayer) && prayers.optString(prayer).length() > 0;

                if (hasStatus) {
                    // Show badge, hide buttons
                    views.setViewVisibility(JAMAH_IDS[i], android.view.View.GONE);
                    views.setViewVisibility(PRAYED_IDS[i], android.view.View.GONE);
                    views.setViewVisibility(BADGE_IDS[i], android.view.View.VISIBLE);

                    String displayStatus = prayers.optString(prayer);
                    views.setTextViewText(BADGE_IDS[i], displayStatus);

                    // Tap badge to open app
                    Intent badgeIntent = new Intent(context, MainActivity.class);
                    PendingIntent pendingBadge = PendingIntent.getActivity(
                        context, i + 100, badgeIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                    views.setOnClickPendingIntent(BADGE_IDS[i], pendingBadge);
                } else {
                    // Show buttons, hide badge
                    views.setViewVisibility(JAMAH_IDS[i], android.view.View.VISIBLE);
                    views.setViewVisibility(PRAYED_IDS[i], android.view.View.VISIBLE);
                    views.setViewVisibility(BADGE_IDS[i], android.view.View.GONE);

                    // Jamah button
                    Intent jamahIntent = new Intent(context, PrayerWidgetReceiver.class);
                    jamahIntent.setAction(PrayerWidgetReceiver.ACTION_LOG_PRAYER);
                    jamahIntent.putExtra("prayer_name", prayer);
                    jamahIntent.putExtra("status", "Jamah");
                    PendingIntent pendingJamah = PendingIntent.getBroadcast(
                        context, i * 2, jamahIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                    views.setOnClickPendingIntent(JAMAH_IDS[i], pendingJamah);

                    // Prayed button
                    Intent prayedIntent = new Intent(context, PrayerWidgetReceiver.class);
                    prayedIntent.setAction(PrayerWidgetReceiver.ACTION_LOG_PRAYER);
                    prayedIntent.putExtra("prayer_name", prayer);
                    prayedIntent.putExtra("status", "Prayed");
                    PendingIntent pendingPrayed = PendingIntent.getBroadcast(
                        context, i * 2 + 1, prayedIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                    views.setOnClickPendingIntent(PRAYED_IDS[i], pendingPrayed);
                }
            }

            // Progress
            int completed = 0;
            for (int i = 0; i < PRAYER_NAMES.length; i++) {
                String p = PRAYER_NAMES[i];
                if (prayers.has(p) && !prayers.isNull(p) && prayers.optString(p).length() > 0) {
                    completed++;
                }
            }
            views.setTextViewText(R.id.progress_text, completed + "/5 done");
            views.setProgressBar(R.id.progress_bar, 5, completed, false);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }

        // Schedule midnight reset
        PrayerWidgetReceiver.scheduleMidnightReset(context);
    }

    @Override
    public void onEnabled(Context context) {
        PrayerWidgetReceiver.scheduleMidnightReset(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(intent.getAction())) {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            ComponentName provider = new ComponentName(context, PrayerWidgetProvider.class);
            int[] ids = manager.getAppWidgetIds(provider);
            onUpdate(context, manager, ids);
        }
    }
}
