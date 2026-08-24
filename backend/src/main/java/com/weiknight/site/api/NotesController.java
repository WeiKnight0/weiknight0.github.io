package com.weiknight.site.api;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1") public class NotesController {
  private static final Path ROOT = Path.of("/workspace/notes/docs").normalize();
  @GetMapping("/session") public void session(HttpSession s) { if (s.getAttribute("userId") == null && !Boolean.TRUE.equals(s.getAttribute("admin"))) throw new Forbidden(); }
  @GetMapping("/admin/notes/tree") public List<String> tree(HttpSession s) throws IOException { admin(s); try (Stream<Path> files=Files.walk(ROOT)) { return files.filter(Files::isRegularFile).map(ROOT::relativize).map(Path::toString).sorted().toList(); } }
  @GetMapping("/admin/notes/file") public String read(@RequestParam String path,HttpSession s) throws IOException { admin(s); return Files.readString(file(path)); }
  @PutMapping("/admin/notes/file") public void write(@RequestBody FileInput input,HttpSession s) throws IOException { admin(s); Path target=file(input.path()); Files.createDirectories(target.getParent()); Files.writeString(target,input.content(),StandardCharsets.UTF_8); publish(); }
  @PostMapping("/admin/notes/move") public void move(@RequestBody MoveInput input,HttpSession s) throws IOException { admin(s); Files.move(file(input.from()),file(input.to())); publish(); }
  @GetMapping("/admin/notes/status") public java.util.Map<String, Boolean> status(HttpSession s) { admin(s); return java.util.Map.of("publishing", Files.exists(ROOT.getParent().resolve(".publish"))); }
  @DeleteMapping("/admin/notes/file") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@RequestParam String path,HttpSession s) throws IOException { admin(s); Files.delete(file(path)); publish(); }
  private Path file(String value) { Path p=ROOT.resolve(value).normalize(); if (!p.startsWith(ROOT)||!p.toString().endsWith(".md")) throw new IllegalArgumentException("Invalid note path"); return p; }
  private void publish() throws IOException { gitCommit(); Files.writeString(ROOT.getParent().resolve(".publish"), "publish"); }
  private void gitCommit() { try { Path repo=ROOT.getParent(); if (!Files.exists(repo.resolve(".git"))) return; new ProcessBuilder("git","-C",repo.toString(),"add","docs","mkdocs.yml").start().waitFor(); new ProcessBuilder("git","-C",repo.toString(),"commit","-m","Update notes from admin").start().waitFor(); } catch (Exception ignored) { } }
  private void admin(HttpSession s){if(!Boolean.TRUE.equals(s.getAttribute("admin")))throw new Forbidden();}
  record FileInput(@NotBlank String path,@NotBlank String content){}
  record MoveInput(@NotBlank String from,@NotBlank String to){}
  @ResponseStatus(HttpStatus.FORBIDDEN) static class Forbidden extends RuntimeException{}
}
