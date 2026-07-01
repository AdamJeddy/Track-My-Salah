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

    private static final String PREFS_NAME = "prayer_widget_prefs";
    private static final String KEY_DATA = "widget_today";

    private SharedPreferences getPrefs() {
        return getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        String date = call.getString("date", "");
        JSObject prayers = call.getObject("prayers", new JSObject());
        long lastModified = System.currentTimeMillis();

        JSONObject data = new JSONObject();
        try {
            data.put("date", date);
            data.put("prayers", prayers);
            data.put("lastModified", lastModified);
        } catch (JSONException e) {
            call.reject("Failed to build widget data: " + e.getMessage());
            return;
        }

        getPrefs().edit().putString(KEY_DATA, data.toString()).apply();
        refreshWidget();
        call.resolve();
    }

    @PluginMethod
    public void getWidgetData(PluginCall call) {
        String json = getPrefs().getString(KEY_DATA, null);
        JSObject result = new JSObject();
        result.put("hasData", json != null);
        if (json != null) {
            try {
                JSONObject data = new JSONObject(json);
                result.put("date", data.optString("date", ""));
                result.put("prayers", data.optJSONObject("prayers") != null
                    ? data.optJSONObject("prayers")
                    : new JSONObject());
                result.put("lastModified", data.optLong("lastModified", 0));
            } catch (JSONException e) {
                result.put("hasData", false);
            }
        }
        call.resolve(result);
    }

    @PluginMethod
    public void openWidgetPicker(PluginCall call) {
        Intent intent = new Intent(AppWidgetManager.ACTION_APPWIDGET_PICK);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        getActivity().startActivity(intent);
        call.resolve();
    }

    private void refreshWidget() {
        Context context = getContext();
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, PrayerWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);
        Intent updateIntent = new Intent(context, PrayerWidgetProvider.class);
        updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(updateIntent);
    }
}
