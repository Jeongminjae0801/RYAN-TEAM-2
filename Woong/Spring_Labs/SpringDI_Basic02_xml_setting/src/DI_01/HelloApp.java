package DI_01;

public class HelloApp {
	
	public static void main(String[] args) {
		MessageBean messagebean = new MessageBean();
		messagebean.sayHello("Hong");
	}
}
/*
요구사항
MessageBean
영문버전(Hong --> Hello Hong ~~ !!)
한글버전(Hong --> 안녕 홍 ~~ !!)
결과를 나눠서 출력
인터페이스로 구현
*/