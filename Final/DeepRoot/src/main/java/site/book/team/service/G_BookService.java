/*
 * @Project : DeepRoot
 * @FileName : G_BookService.java
 * @Date : 2018. 6. 5.
 * @Author : 김희준
*/


package site.book.team.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import site.book.team.dao.G_BookDAO;
import site.book.team.dto.G_BookDTO;
import site.book.user.dao.U_BookDAO;
import site.book.user.dto.U_BookDTO;

/**
 * @Class : G_BookService.java
 * @Date : 2018. 6. 7.
 * @Author : 김희준
 */
@Service
public class G_BookService {
	//희준
	@Autowired
	private SqlSession sqlsession;
	
	//태웅
	
	
	//희준
	// 그룹이 추가한 북마크 수
	public List<HashMap<String, String>> numOfBookByDate() {
		G_BookDAO bookDAO = sqlsession.getMapper(G_BookDAO.class);
		List<HashMap<String, String>> map = null;
		
		try {
			map = bookDAO.numOfBookByDate();
		} catch (ClassNotFoundException | SQLException e) {
			e.printStackTrace();
		}
		
		return map;
	}
	
	// 완료된 그룹 북마크 가져오기
	public List<G_BookDTO> getCompletedTeamBookmark(int gid) {
		
		G_BookDAO bookDAO = sqlsession.getMapper(G_BookDAO.class);
		List<G_BookDTO> list = bookDAO.getCompletedTeamBookmark(gid);
		
		return list;
	}
	
	//태웅
	// 진행중인 그룹에서 카테고리만 가져오기
	public List<G_BookDTO> getGroupCategoryList(String uid) {
		G_BookDAO dao = sqlsession.getMapper(G_BookDAO.class);
		List<G_BookDTO> list = dao.getGroupCategoryList(uid);
		
		return list;
	}
	
	// 현재  GBID(Group Bookmark ID)의  max + 1  
	// 그룹 처음 생성 시, 루트 폴더 생성
	@Transactional
	public int getMaxIDandInsertRootFolder(String uid) {
		G_BookDAO dao = sqlsession.getMapper(G_BookDAO.class);
		int isInsert = 0;
		
		int gbid = dao.getMaxGBID();
		isInsert = dao.insertRootFolder(gbid, uid);
		// Root 폴터 생성 성공이라면, 
		if(isInsert > 0) {
			isInsert = gbid; // GBID return;
		}
		return isInsert;
	}
}
