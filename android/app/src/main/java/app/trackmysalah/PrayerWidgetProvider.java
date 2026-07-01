package app.trackmysalah;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
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

    private static final int[] JAMAH_IDS = {
        R.id.btn_fajr_jamah, R.id.btn_dhuhr_jamah, R.id.btn_asr_jamah, R.id.btn_maghrib_jamah, R.id.btn_isha_jamah
    };
    private static final int[] PRAYED_IDS = {
        R.id.btn_fajr_prayed, R.id.btn_dhuhr_prayed, R.id.btn_asr_prayed, R.id.btn_maghrib_prayed, R.id.btn_isha_prayed
    };
    private static final int[] BADGE_IDS = {
        R.id.badge_fajr, R.id.badge_dhuhr, R.id.badge_asr, R.id.badge_maghrib, R.id.badge_isha
    };

    private static final int REQUEST_HEADER = 1000;

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
                context, REQUEST_HEADER, openApp, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_header, pendingOpen);

            // Prayer rows
            for (int i = 0; i < PRAYER_NAMES.length; i++) {
                String prayer = PRAYER_NAMES[i];
                boolean hasStatus = prayers.has(prayer) && !prayers.isNull(prayer) && prayers.optString(prayer).length() > 0;

                if (hasStatus) {
                    views.setViewVisibility(JAMAH_IDS[i], android.view.View.GONE);
                    views.setViewVisibility(PRAYED_IDS[i], android.view.View.GONE);
                    views.setViewVisibility(BADGE_IDS[i], android.view.View.VISIBLE);

                    String status = prayers.optString(prayer);
                    views.setTextViewText(BADGE_IDS[i], status);

                    // Color badge by status
                    int badgeColor;
                    switch (status) {
                        case "Jamah":
                            badgeColor = 0xFF16a34a; // green
                            break;
                        case "Prayed":
                            badgeColor = 0xFF2563eb; // blue
                            break;
                        case "Qada":
                            badgeColor = 0xFFd97706; // amber
                            break;
                        case "Missed":
                            badgeColor = 0xFFdc2626; // red
                            break;
                        case "Excused":
                            badgeColor = 0xFF6b7280; // gray
                            break;
                        default:
                            badgeColor = 0xFF374151;
                    }
                    views.setTextColor(BADGE_IDS[i], badgeColor);

                    // Tap badge to open app
                    Intent badgeIntent = new Intent(context, MainActivity.class);
                    PendingIntent pendingBadge = PendingIntent.getActivity(
                        context, REQUEST_HEADER + 1 + i, badgeIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                    views.setOnClickPendingIntent(BADGE_IDS[i], pendingBadge);
                } else {
                    views.setViewVisibility(JAMAH_IDS[i], android.view.View.VISIBLE);
                    views.setViewVisibility(PRAYED_IDS[i], android.view.View.VISIBLE);
                    views.setViewVisibility(BADGE_IDS[i], android.view.View.GONE);

                    // Jamah button
                    Intent jamahIntent = new Intent(context, PrayerWidgetReceiver.class);
                    jamahIntent.setAction(PrayerWidgetReceiver.ACTION_LOG_PRAYER);
                    jamahIntent.putExtra("prayer_name", prayer);
                    jamahIntent.putExtra("status", "Jamah");
                    PendingIntent pendingJamah = PendingIntent.getBroadcast(
                        context, i, jamahIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                    views.setOnClickPendingIntent(JAMAH_IDS[i], pendingJamah);

                    // Prayed button
                    Intent prayedIntent = new Intent(context, PrayerWidgetReceiver.class);
                    prayedIntent.setAction(PrayerWidgetReceiver.ACTION_LOG_PRAYER);
                    prayedIntent.putExtra("prayer_name", prayer);
                    prayedIntent.putExtra("status", "Prayed");
                    PendingIntent pendingPrayed = PendingIntent.getBroadcast(
                        context, i + 10, prayedIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
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
}
