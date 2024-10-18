package com.project.todo_comment_generator;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:3000")
public class projectController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String pythonServiceUrl = "http://localhost:5000/generate-comment";

    @PostMapping("/generate-comment")
    public String generateComment(@RequestBody String code) {
        String response = restTemplate.postForObject(pythonServiceUrl, new CodeRequest(code), String.class);
        return response;
    }

    @GetMapping("/welcome")
    public String welcome(){
        return "Welcome to project";
    }

    @PostMapping("/extract")
    public List<String> extractTodos(@RequestParam String requestBody, @RequestParam boolean isFilePath) throws IOException {
        List<String> todos = new ArrayList<>();

        // Check if input is a file or code snippet
        if (isFilePath) {
            // Input is a file or directory path
            try {
                Path path = Paths.get(requestBody);
                extractData(path, todos);
            } catch (IOException e) {
                todos.add("Error reading files: " + e.getMessage());
            }
        } else {
            // Input is treated as a code snippet
            todos.addAll(extractFromSnippet(requestBody));
        }

        return todos;
    }

    private void extractData(Path path, List<String> todos) throws IOException {
        if (Files.isDirectory(path)) {
            // Read all files in the directory
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
                for (Path file : stream) {
                    //Calls recursively if directory inside directory
                    if (Files.isDirectory(file)){
                        extractData(file, todos);
                    }
                    else {
                        todos.addAll(extractFromFile(file));
                    }
                }
            }
        } else {
            // Read the single file
            todos.addAll(extractFromFile(path));
        }
    }

    private List<String> extractFromSnippet(String codeSnippet) {
        return extractTodosFromText(codeSnippet, null);
    }

    private List<String> extractFromFile(Path filePath) {
        try {
            String content = new String(Files.readAllBytes(filePath));
            return extractTodosFromText(content, filePath);
        } catch (IOException e) {
            return List.of("Error reading file " + filePath + ": " + e.getMessage());
        }
    }

    private List<String> extractTodosFromText(String text, Path filePath) {
        List<String> todos = new ArrayList<>();
        String regex = "(//\\s*TODO:.*?$|/\\*\\s*TODO:.*?\\*/)";
        Pattern pattern = Pattern.compile(regex, Pattern.MULTILINE);
        Matcher matcher = pattern.matcher(text);

        while (matcher.find()) {
            if (filePath != null){
                todos.add(filePath + ": " + matcher.group());
            } else {
                todos.add(matcher.group());
            }
        }

        return todos;
    }

    static class CodeRequest {
        private String code;

        public CodeRequest(String code) {
            this.code = code;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;

        }
    }


    /*@PostMapping("/extract")
    public List<String> extractTodos(@RequestBody String codeSnippet) {
        List<String> todos = new ArrayList<>();

        // Regex pattern to match TODO comments
        String regex =
        Pattern pattern = Pattern.compile(regex, Pattern.MULTILINE);
        Matcher matcher = pattern.matcher(codeSnippet);

        while (matcher.find()) {
            todos.add(matcher.group());
        }

        return todos;
    }*/

}