package com.buyersmatch.filters;

import com.buyersmatch.services.AdminAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Component
@Order(1)
@RequiredArgsConstructor
public class AdminSessionFilter extends OncePerRequestFilter {

    private final AdminAuthService adminAuthService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Only protect /api/admin/** routes
        if (!path.startsWith("/api/admin/")) {
            return true;
        }
        // Login is public — all other auth endpoints (logout, change-password) require a valid token
        return path.equals("/api/admin/auth/login");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = request.getHeader("X-Admin-Token");
        try {
            adminAuthService.validateSession(token);
            filterChain.doFilter(request, response);
        } catch (ResponseStatusException ex) {
            response.setStatus(ex.getStatusCode().value());
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"error\":\"" + ex.getReason() + "\"}");
        }
    }
}
