package app.trackmysalah;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsetsController;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(PrayerWidgetPlugin.class);
    }

    @Override
    public void onResume() {
        super.onResume();
        // Force light/white status bar icons on Samsung One UI devices
        // that ignore the Capacitor StatusBar plugin's setStyle() calls.
        // Sets APPEARANCE_LIGHT_STATUS_BARS to 0 (off) so icons render light.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.setSystemBarsAppearance(
                    0,
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                );
            }
        }
    }
}
