package com.taptile.controller;

import com.taptile.model.Score;
import com.taptile.repository.ScoreRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@Controller
public class GameController {

    private static final Set<String> LEVELS = Set.of("Easy", "Medium", "Hard");

    private final ScoreRepository repo;

    public GameController(ScoreRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/play")
    public String play(@RequestParam(defaultValue = "Player") String name,
                       @RequestParam(defaultValue = "Easy") String difficulty,
                       Model model) {
        model.addAttribute("name", cleanName(name));
        model.addAttribute("difficulty", LEVELS.contains(difficulty) ? difficulty : "Easy");
        return "play";
    }

    /** JavaScript fetch() game over hone par yahan score bhejta hai. */
    @PostMapping("/scores")
    @ResponseBody
    public ResponseEntity<String> save(@RequestBody Score s) {
        if (s.getScore() < 0 || s.getScore() > 100000 || !LEVELS.contains(s.getDifficulty())) {
            return ResponseEntity.badRequest().body("invalid");
        }
        Score toSave = new Score();
        toSave.setPlayerName(cleanName(s.getPlayerName()));
        toSave.setScore(s.getScore());
        toSave.setDifficulty(s.getDifficulty());
        repo.save(toSave);
        return ResponseEntity.ok("saved");
    }

    @GetMapping("/leaderboard")
    public String leaderboard(Model model) {
        model.addAttribute("scores", repo.findTop10ByOrderByScoreDescCreatedDateAsc());
        return "leaderboard";
    }

    private String cleanName(String name) {
        if (name == null || name.trim().isEmpty()) return "Player";
        String n = name.trim();
        return n.length() > 20 ? n.substring(0, 20) : n;
    }
}
