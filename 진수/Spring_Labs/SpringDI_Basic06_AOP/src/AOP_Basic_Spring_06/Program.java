package AOP_Basic_Spring_06;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.GenericXmlApplicationContext;

public class Program {

	public static void main(String[] args) {
		//proxy 객체 생성
		//proxy 를 통해서 함수 실행
		//Spring xml 설정을 통해서 ......
		
		ApplicationContext context = 
				new GenericXmlApplicationContext("classpath:AOP_Basic_Spring_06/ApplicationContext.xml");
		Calc calc = context.getBean("proxy",Calc.class);
		
	   //int result =	calc.ADD(10000,50000);
	   //int result =	calc.MUL(10000,50000);
		int result =	calc.SUB(10,5); //공통자원 (보조 업무 ) 실행 안되요 ....
	   System.out.println("결과 :" + result);	

	}

}
