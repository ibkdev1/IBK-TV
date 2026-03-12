package com.ibktv.app;

import android.content.Context;
import com.google.gson.Gson;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class ChannelRepository {

    public static class ChannelData {
        public List<String> categories;
        public List<Channel> channels;
    }

    public static ChannelData load(Context ctx) {
        try {
            InputStream is = ctx.getAssets().open("channels.json");
            InputStreamReader reader = new InputStreamReader(is, "UTF-8");
            ChannelData data = new Gson().fromJson(reader, ChannelData.class);
            reader.close();
            return data;
        } catch (Exception e) {
            ChannelData empty = new ChannelData();
            empty.categories = new ArrayList<>();
            empty.channels   = new ArrayList<>();
            return empty;
        }
    }
}
