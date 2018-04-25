package DI2;

public class NewRecordView {
	//점수 출력 (NewRecord 객체가 필요)
	private NewRecord record;
	
	//1. 생성자를 통해서 필요한 객체 생성/주입 >> DI
	//2. 함수(setter)를 통해서 필요한 객체를 주입 >> DI2
	
/*	public NewRecord getRecord() {
		return record;
	}
*/
	public void setRecord(NewRecord record) {	//함수의 파라미터로 NewRecord 객체의 주소
		this.record = record;
	} 
	
	public void print() {
		System.out.println(record.total() + " / " + record.avg());
	}

}
