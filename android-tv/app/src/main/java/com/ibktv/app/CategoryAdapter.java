package com.ibktv.app;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class CategoryAdapter extends RecyclerView.Adapter<CategoryAdapter.ViewHolder> {

    public interface OnCategoryClick {
        void onClick(String category);
    }

    private final List<String> categories;
    private final OnCategoryClick listener;
    private int selectedPos = 0;

    public CategoryAdapter(List<String> categories, OnCategoryClick listener) {
        this.categories = categories;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_category, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        String cat = categories.get(position);
        holder.tv.setText(cat);

        if (position == selectedPos) {
            holder.tv.setBackgroundColor(Color.parseColor("#E63333"));
            holder.tv.setTextColor(Color.WHITE);
        } else {
            holder.tv.setBackgroundColor(Color.parseColor("#2A2A35"));
            holder.tv.setTextColor(Color.parseColor("#AAAAAA"));
        }

        holder.tv.setOnClickListener(v -> {
            int old = selectedPos;
            selectedPos = position;
            notifyItemChanged(old);
            notifyItemChanged(selectedPos);
            listener.onClick(cat);
        });
    }

    @Override
    public int getItemCount() {
        return categories != null ? categories.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tv;

        ViewHolder(View v) {
            super(v);
            tv = v.findViewById(R.id.tvCategory);
        }
    }
}
