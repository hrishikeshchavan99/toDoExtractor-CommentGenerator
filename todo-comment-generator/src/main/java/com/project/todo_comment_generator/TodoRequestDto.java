package com.project.todo_comment_generator;


public class TodoRequestDto {
    private String requestBody;
    private boolean isFilePath;

    public String getRequestBody() {
        return requestBody;
    }

    public void setRequestBody(String requestBody) {
        this.requestBody = requestBody;
    }

    public boolean getIsFilePath() {
        return isFilePath;
    }

    public void setIsFilePath(boolean isFilePath) {
        this.isFilePath = isFilePath;
    }
}
