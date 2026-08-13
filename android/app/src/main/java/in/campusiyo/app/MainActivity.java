package in.campusiyo.app;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public int getVersionCode() {
                    try {
                        return getPackageManager().getPackageInfo(getPackageName(), 0).versionCode;
                    } catch (Exception e) {
                        return 1;
                    }
                }

                @JavascriptInterface
                public String getVersionName() {
                    try {
                        return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
                    } catch (Exception e) {
                        return "1.0.0";
                    }
                }

                @JavascriptInterface
                public boolean isNativeApp() {
                    return true;
                }
            }, "CampusiyoNative");
        }
    }
}
