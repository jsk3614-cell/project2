package me.shinsunyoung.springbootdeveloper.dto;

import lombok.Getter;

@Getter
public class UpdateArticleRequest {
    private String title;
    private String content;

    public UpdateArticleRequest() {
    }

    public UpdateArticleRequest(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }
}
