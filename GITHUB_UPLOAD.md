# GitHub 업로드

## 웹에서 업로드
1. GitHub에서 새 repository 생성
2. 이 ZIP을 압축 해제
3. repository의 **Add file → Upload files**
4. 압축 해제된 파일/폴더 전체 업로드
5. Commit changes

## Git 사용 시
```bash
git init
git add .
git commit -m "feat: initialize NOAH Intelligence v0.1"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

## 로컬 실행
```bash
npm install
npm run dev
```
