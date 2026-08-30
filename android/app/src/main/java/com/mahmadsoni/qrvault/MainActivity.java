package com.mahmadsoni.qrvault;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/**
 * QR Vault runs entirely inside Capacitor's WebView bridge. Back-button
 * handling (navigating within the app before exiting) and the standard
 * Android app lifecycle are provided by BridgeActivity out of the box.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}
