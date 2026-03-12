package com.ibktv.app;

import android.os.Bundle;
import android.os.Handler;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.OptIn;
import androidx.appcompat.app.AppCompatActivity;
import androidx.media3.common.MediaItem;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.datasource.DefaultHttpDataSource;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.hls.HlsMediaSource;
import androidx.media3.ui.PlayerView;
import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;

@OptIn(markerClass = UnstableApi.class)
public class PlayerActivity extends AppCompatActivity {

    private ExoPlayer    player;
    private PlayerView   playerView;
    private LinearLayout overlay, errorLayout;
    private ProgressBar  progressBar;
    private TextView     tvChannelName, tvStatus, tvError;
    private Button       btnRetry;

    private Channel channel;
    private boolean usingBackup = false;
    private final Handler handler = new Handler();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_player);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemUI();

        playerView   = findViewById(R.id.playerView);
        overlay      = findViewById(R.id.overlay);
        errorLayout  = findViewById(R.id.errorLayout);
        progressBar  = findViewById(R.id.progressBar);
        tvChannelName = findViewById(R.id.tvChannelName);
        tvStatus     = findViewById(R.id.tvStatus);
        tvError      = findViewById(R.id.tvError);
        btnRetry     = findViewById(R.id.btnRetry);

        String json = getIntent().getStringExtra("channel");
        channel = new Gson().fromJson(json, Channel.class);

        btnRetry.setOnClickListener(v -> {
            usingBackup = false;
            playChannel();
        });

        playChannel();
        showOverlay();
    }

    private void playChannel() {
        errorLayout.setVisibility(View.GONE);
        progressBar.setVisibility(View.VISIBLE);

        String url = (usingBackup && channel.backupUrl != null && !channel.backupUrl.isEmpty())
                ? channel.backupUrl : channel.streamUrl;

        if (player != null) {
            player.release();
            player = null;
        }

        // Build HTTP data source with custom headers (Referer for some streams)
        DefaultHttpDataSource.Factory dsFactory = new DefaultHttpDataSource.Factory()
                .setUserAgent("IBK-TV/2.0 (Android)")
                .setAllowCrossProtocolRedirects(true);

        if (channel.referer != null && !channel.referer.isEmpty()) {
            Map<String, String> headers = new HashMap<>();
            headers.put("Referer", channel.referer);
            headers.put("Origin",  channel.referer.replaceAll("/$", ""));
            dsFactory.setDefaultRequestProperties(headers);
        }

        HlsMediaSource mediaSource = new HlsMediaSource.Factory(dsFactory)
                .createMediaSource(MediaItem.fromUri(url));

        player = new ExoPlayer.Builder(this).build();
        playerView.setPlayer(player);
        player.setMediaSource(mediaSource);
        player.prepare();
        player.setPlayWhenReady(true);

        player.addListener(new Player.Listener() {
            @Override
            public void onPlaybackStateChanged(int state) {
                if (state == Player.STATE_READY) {
                    progressBar.setVisibility(View.GONE);
                    tvStatus.setText("En direct ●");
                } else if (state == Player.STATE_BUFFERING) {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onPlayerError(@NonNull PlaybackException error) {
                progressBar.setVisibility(View.GONE);
                // Try backup URL once
                if (!usingBackup && channel.backupUrl != null && !channel.backupUrl.isEmpty()) {
                    usingBackup = true;
                    playChannel();
                } else {
                    showError("Flux indisponible\n" + channel.name);
                }
            }
        });

        tvChannelName.setText(channel.name);
    }

    private void showOverlay() {
        overlay.setVisibility(View.VISIBLE);
        handler.removeCallbacksAndMessages(null);
        handler.postDelayed(() -> overlay.setVisibility(View.GONE), 3000);
    }

    private void showError(String msg) {
        tvError.setText(msg);
        errorLayout.setVisibility(View.VISIBLE);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            finish();
            return true;
        }
        showOverlay();
        return super.onKeyDown(keyCode, event);
    }

    private void hideSystemUI() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN);
    }

    @Override
    protected void onResume() {
        super.onResume();
        hideSystemUI();
        if (player != null) player.setPlayWhenReady(true);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (player != null) player.setPlayWhenReady(false);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        handler.removeCallbacksAndMessages(null);
        if (player != null) {
            player.release();
            player = null;
        }
    }
}
