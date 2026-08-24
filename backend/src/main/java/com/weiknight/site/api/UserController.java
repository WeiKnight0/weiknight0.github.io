package com.weiknight.site.api;
import com.weiknight.site.user.*;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") public class UserController {
 private final SiteUserRepository users; private final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
 UserController(SiteUserRepository users){this.users=users;}
 @PostMapping("/user-auth/login") public void login(@Valid @RequestBody Credentials input,HttpSession s){SiteUser u=users.findByUsername(input.username()).filter(x->encoder.matches(input.password(),x.passwordHash())).orElseThrow(Forbidden::new);s.setAttribute("userId",u.getId());}
 @PostMapping("/user-auth/logout") public void logout(HttpSession s){s.removeAttribute("userId");}
 @GetMapping("/user-auth/me") public SiteUser me(HttpSession s){return users.findById((Long)require(s)).orElseThrow(Forbidden::new);}
 @GetMapping("/admin/users") public List<SiteUser> list(HttpSession s){admin(s);return users.findAll();}
 @PostMapping("/admin/users") @ResponseStatus(HttpStatus.CREATED) public SiteUser create(@Valid @RequestBody Credentials input,HttpSession s){admin(s);SiteUser u=new SiteUser();u.create(input.username(),encoder.encode(input.password()));return users.save(u);}
 @DeleteMapping("/admin/users/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id,HttpSession s){admin(s);users.deleteById(id);}
 private Object require(HttpSession s){Object id=s.getAttribute("userId");if(id==null)throw new Forbidden();return id;}
 private void admin(HttpSession s){if(!Boolean.TRUE.equals(s.getAttribute("admin")))throw new Forbidden();}
 record Credentials(@NotBlank String username,@NotBlank String password){}
 @ResponseStatus(HttpStatus.FORBIDDEN) static class Forbidden extends RuntimeException{}
}
