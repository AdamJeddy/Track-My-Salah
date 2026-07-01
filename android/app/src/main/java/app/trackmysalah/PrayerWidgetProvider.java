package app.trackmysalah;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class PrayerWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "prayer_widget_prefs";
    private static final String KEY_DATA = "widget_month";

    private static final int[] CELL_IDS = new int[35];
    static { for (int i = 0; i < 35; i++) CELL_IDS[i] = getCellId(i); }

    private static int getCellId(int i) {
        switch (i) {
            case 0: return R.id.cell_0; case 1: return R.id.cell_1; case 2: return R.id.cell_2; case 3: return R.id.cell_3;
            case 4: return R.id.cell_4; case 5: return R.id.cell_5; case 6: return R.id.cell_6; case 7: return R.id.cell_7;
            case 8: return R.id.cell_8; case 9: return R.id.cell_9; case 10: return R.id.cell_10; case 11: return R.id.cell_11;
            case 12: return R.id.cell_12; case 13: return R.id.cell_13; case 14: return R.id.cell_14; case 15: return R.id.cell_15;
            case 16: return R.id.cell_16; case 17: return R.id.cell_17; case 18: return R.id.cell_18; case 19: return R.id.cell_19;
            case 20: return R.id.cell_20; case 21: return R.id.cell_21; case 22: return R.id.cell_22; case 23: return R.id.cell_23;
            case 24: return R.id.cell_24; case 25: return R.id.cell_25; case 26: return R.id.cell_26; case 27: return R.id.cell_27;
            case 28: return R.id.cell_28; case 29: return R.id.cell_29; case 30: return R.id.cell_30; case 31: return R.id.cell_31;
            case 32: return R.id.cell_32; case 33: return R.id.cell_33; case 34: return R.id.cell_34;
            default: return 0;
        }
    }

    private static int getDrawable(String status) {
        switch (status) {
            case "complete": return R.drawable.cell_complete;
            case "partial": return R.drawable.cell_partial;
            case "missed": return R.drawable.cell_missed;
            default: return R.drawable.cell_none;
        }
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String json = prefs.getString(KEY_DATA, null);
        String monthLabel = "Month"; int firstDow = 0, numDays = 0, tracked = 0; JSONArray days = null;
        if (json != null) try {
            JSONObject d = new JSONObject(json);
            monthLabel = d.optString("monthLabel", "Month");
            firstDow = d.optInt("firstDayOfWeek", 0);
            numDays = d.optInt("numDays", 0);
            tracked = d.optInt("trackedDays", 0);
            days = d.optJSONArray("days");
        } catch (JSONException e) {}

        boolean dark = (ctx.getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        int bg = dark ? R.drawable.widget_background_dark : R.drawable.widget_background;
        int tc = dark ? 0xFFF9FAFB : 0xFF111827;
        int sc = dark ? 0xFFD1D5DB : 0xFF6b7280;

        for (int id : ids) {
            RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.prayer_widget);
            v.setInt(R.id.widget_root, "setBackgroundResource", bg);
            v.setTextColor(R.id.month_label, tc); v.setTextViewText(R.id.month_label, monthLabel);
            v.setTextColor(R.id.summary_text, sc);
            v.setOnClickPendingIntent(R.id.widget_header, PendingIntent.getActivity(ctx, 1000, new Intent(ctx, MainActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            for (int p = 0; p < 35; p++) {
                if (p < firstDow || p >= firstDow + numDays) v.setViewVisibility(CELL_IDS[p], android.view.View.INVISIBLE);
                else {
                    v.setViewVisibility(CELL_IDS[p], android.view.View.VISIBLE);
                    String s = "none"; int di = p - firstDow;
                    if (days != null && di < days.length()) try { s = days.getJSONObject(di).optString("status", "none"); } catch (JSONException e) {}
                    v.setInt(CELL_IDS[p], "setBackgroundResource", getDrawable(s));
                }
            }

            String sum = tracked + "/" + numDays + " days logged";
            if (numDays > 0) sum += "  " + Math.round((float) tracked / numDays * 100) + "%";
            v.setTextViewText(R.id.summary_text, sum);
            mgr.updateAppWidget(id, v);
        }
    }
}
