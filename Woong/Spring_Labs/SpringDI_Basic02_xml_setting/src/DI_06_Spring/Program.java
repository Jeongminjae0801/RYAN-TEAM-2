package DI_06_Spring;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.GenericXmlApplicationContext;

public class Program {
	public static void main(String[] args) {
		//Oracle 연동
		//요청 --> 글쓰기
		/*OracleArticleDao dao = new OracleArticleDao();
		WriteArticleService service = new WriteArticleService(dao);
		
		Article article = new Article();*/
		
		ApplicationContext context = 
				new GenericXmlApplicationContext("classpath:DI_06_Spring/DI_06.xml");
		
		WriteArticleService service = context.getBean("service", WriteArticleService.class);
		Article article = context.getBean("article", Article.class);
		
		service.write(article);
		
	}
}