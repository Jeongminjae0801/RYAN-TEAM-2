package site.book.main.handler;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

/**
 * @Class : AdminController.java
 * @Date : 2018. 6. 12.
 * @Author : 김태웅
 */
public class LoginFailHandler implements AuthenticationFailureHandler {

	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException exception) throws IOException, ServletException {
		
		request.setAttribute("prev_uid", request.getParameter("uid"));
		request.getRequestDispatcher("/login_view?error=true").forward(request, response);
		
		
	}
	
}