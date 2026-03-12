package com.ibktv.app;

import android.content.Intent;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private RecyclerView rvCategories, rvChannels;
    private TextView tvChannelCount;
    private ChannelAdapter channelAdapter;
    private List<Channel> allChannels = new ArrayList<>();
    private String selectedCategory = "All";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        rvCategories   = findViewById(R.id.rvCategories);
        rvChannels     = findViewById(R.id.rvChannels);
        tvChannelCount = findViewById(R.id.tvChannelCount);

        // Load channels from assets/channels.json
        ChannelRepository.ChannelData data = ChannelRepository.load(this);
        allChannels = data.channels != null ? data.channels : new ArrayList<>();
        List<String> categories = data.categories != null ? data.categories : new ArrayList<>();

        // Category tabs (horizontal)
        CategoryAdapter catAdapter = new CategoryAdapter(categories, cat -> {
            selectedCategory = cat;
            filterChannels();
        });
        rvCategories.setLayoutManager(
                new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        rvCategories.setAdapter(catAdapter);

        // Channel grid — 6 cols on TV/tablet, 4 on phone
        int cols = getResources().getConfiguration().screenWidthDp >= 840 ? 6 : 4;
        channelAdapter = new ChannelAdapter(new ArrayList<>(), channel -> {
            Intent intent = new Intent(this, PlayerActivity.class);
            intent.putExtra("channel", new Gson().toJson(channel));
            startActivity(intent);
        });
        rvChannels.setLayoutManager(new GridLayoutManager(this, cols));
        rvChannels.setAdapter(channelAdapter);

        filterChannels();
    }

    private void filterChannels() {
        List<Channel> filtered = new ArrayList<>();
        for (Channel ch : allChannels) {
            if ("All".equals(selectedCategory) || selectedCategory.equals(ch.category)) {
                filtered.add(ch);
            }
        }
        channelAdapter.setChannels(filtered);
        tvChannelCount.setText(filtered.size() + " channels");
    }
}
