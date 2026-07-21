package app.trackmysalah;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "PrayerWidget")
public class PrayerWidgetPlugin extends Plugin {

    private static final String PREFS = "prayer_widget_prefs";
    private static final String KEY = "widget_month";

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        JSObject data = call.getObject("data", new JSObject());
        JSONObject json = new JSONObject();
        try {
            json.put("monthLabel", data.getString("monthLabel", ""));
            json.put("firstDayOfWeek", data.getInteger("firstDayOfWeek", 0));
            json.put("numDays", data.getInteger("numDays", 0));
            json.put("trackedDays", data.getInteger("trackedDays", 0));
            json.put("days", data.getJSONArray("days"));
            json.put("lastModified", System.currentTimeMillis());
        } catch (JSONException e) { call.reject("Failed: " + e.getMessage()); return; }
        getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, json.toString()).apply();
        refreshWidget();
        call.resolve();
    }

    private void refreshWidget() {
        Context ctx = getContext();
        ComponentName cn = new ComponentName(ctx, PrayerWidgetProvider.class);
        Intent in = new Intent(ctx, PrayerWidgetProvider.class);
        in.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        in.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, AppWidgetManager.getInstance(ctx).getAppWidgetIds(cn));
        ctx.sendBroadcast(in);
    }
}
