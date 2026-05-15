package com.finflow.app;

import android.Manifest;
import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.Telephony;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(
    name = "SMSReader",
    permissions = {
        @Permission(
            alias = "sms",
            strings = {Manifest.permission.READ_SMS, Manifest.permission.RECEIVE_SMS}
        )
    }
)
public class SMSReaderPlugin extends Plugin {

    @PluginMethod
    public void getSMS(PluginCall call) {
        if (getPermissionState("sms") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("sms", call, "smsCallback");
        } else {
            loadSMS(call);
        }
    }

    @com.getcapacitor.PermissionCallback
    private void smsCallback(PluginCall call) {
        if (getPermissionState("sms") == com.getcapacitor.PermissionState.GRANTED) {
            loadSMS(call);
        } else {
            call.reject("Permission is required to read SMS");
        }
    }

    private void loadSMS(PluginCall call) {
        JSObject response = new JSObject();
        List<JSObject> smsList = new ArrayList<>();

        ContentResolver cr = getContext().getContentResolver();
        Cursor cursor = cr.query(Telephony.Sms.CONTENT_URI, null, null, null, "date DESC LIMIT 50");

        if (cursor != null && cursor.moveToFirst()) {
            do {
                JSObject sms = new JSObject();
                sms.put("address", cursor.getString(cursor.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)));
                sms.put("body", cursor.getString(cursor.getColumnIndexOrThrow(Telephony.Sms.BODY)));
                sms.put("date", cursor.getLong(cursor.getColumnIndexOrThrow(Telephony.Sms.DATE)));
                smsList.add(sms);
            } while (cursor.moveToNext());
            cursor.close();
        }

        response.put("sms", smsList);
        call.resolve(response);
    }
}
