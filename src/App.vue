<template>
  <div class="page">
    <main class="paper" aria-label="이력서" ref="resumeRef">
      <header class="header">
        <div>
          <h1 class="name" @click="cnt++">{{ resume.profile.name }}</h1>
          <p class="headline">{{ headlinePeriod }}</p>

          <div class="meta">
            <template v-for="(c, idx) in resume.profile.contacts" :key="idx">
              <a v-if="c.href" class="meta-item" :href="c.href" target="_blank" rel="noreferrer">
                {{ c.prefix }} {{ c.label }}
              </a>
              <span v-else>{{ c.label }}</span>
            </template>
          </div>
        </div>

        <button v-if="showPdf" class="pdf-btn" @click="downloadPdf">
          PDF 다운로드
        </button>
      </header>

      <section v-if="resume.profile.summary?.length" class="summary">
        <h2 class="section-title">소개</h2>
        <ul class="bullets">
          <li v-for="(line, i) in resume.profile.summary" :key="i">{{ line }}</li>
        </ul>
      </section>

      <hr class="divider" />

      <section v-if="resume.experiences?.length" class="section">
        <h2 class="section-title">경력</h2>

        <article v-for="(exp, i) in resume.experiences" :key="i" class="item">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path
                d="M10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1h3V4a2 2 0 0 1 2-2Zm0 6h4V4h-4v4Zm-4 2v9h12v-9H6Z" />
            </svg>
          </div>

          <div>
            <div class="item-head">
              <span class="org">{{ exp.company }}</span>
              <span v-if="exp.position" class="role">{{ exp.position }}</span>
              <span class="period">{{ calcPeriodYearsMonths(exp.start, exp.end) }}</span>
            </div>

            <p v-if="exp.description" class="desc">{{ exp.description }}</p>

            <ul v-if="exp.highlights?.length" class="bullets">
              <li v-for="(b, bi) in exp.highlights" :key="bi">{{ b }}</li>
            </ul>

            <div v-if="exp.projects?.length" class="projects">
              <div v-for="(p, pi) in exp.projects" :key="pi" class="project">
                <div class="project-head">
                  <span class="project-name">{{ p.name }}</span>
                  <span v-if="p.period" class="project-period">{{ p.period }}</span>
                </div>
                <ul v-if="p.bullets?.length" class="bullets">
                  <li v-for="(pb, pbi) in p.bullets" :key="pbi">{{ pb }}</li>
                </ul>
                <p v-if="p.stack" class="stack"><b>기술</b>: {{ p.stack }}</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section v-if="resume.education?.length" class="section">
        <h2 class="section-title">학력</h2>
        <article v-for="(edu, i) in resume.education" :key="i" class="item item--compact">
          <div class="icon icon--dark" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path
                d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm0 14L4.24 12.8 12 8.58l7.76 4.22L12 17Zm-6 2.2V15l6 3.27 6-3.27v4.2L12 22l-6-2.8Z" />
            </svg>
          </div>
          <div>
            <div class="item-head">
              <span class="org">{{ edu.school }}</span>
              <span v-if="edu.major" class="role">{{ edu.major }}</span>
              <span class="period">{{ edu.period }}</span>
            </div>
            <p v-if="edu.note" class="desc">{{ edu.note }}</p>
          </div>
        </article>
      </section>

      <section class="bottom">
        <div v-if="resume.skills?.length" class="mini">
          <h3>스킬</h3>
          <div class="tags">
            <span v-for="(s, i) in resume.skills" :key="i" class="tag">{{ s }}</span>
          </div>
        </div>

        <div v-if="resume.bootcamp?.length" class="mini">
          <h3>교육</h3>
          <ul class="plain-list">
            <li v-for="(c, i) in resume.bootcamp" :key="i">
              <span class="plain-title">{{ c.name }}</span>
              <span class="plain-meta">{{ c.meta }}</span>
            </li>
          </ul>
        </div>

        <div v-if="resume.certificates?.length" class="mini">
          <h3>자격증/수상</h3>
          <ul class="plain-list">
            <li v-for="(c, i) in resume.certificates" :key="i">
              <span class="plain-title">{{ c.name }}</span>
              <span class="plain-meta">{{ c.meta }}</span>
            </li>
          </ul>
        </div>

        <div v-if="resume.languages?.length" class="mini">
          <h3>외국어</h3>
          <ul class="plain-list">
            <li v-for="(l, i) in resume.languages" :key="i">
              <span class="plain-title">{{ l.name }}</span>
              <span class="plain-meta">{{ l.meta }}</span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import html2pdf from 'html2pdf.js';

const resumeRef = ref(null);

function downloadPdf() {
  const element = resumeRef.value;

  const opt = {
    margin: [10, 10, 10, 10],
    filename: '서상훈_이력서.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
  };

  html2pdf().set(opt).from(element).save();
  cnt.value = 0;
}
const cnt = ref(0);
const showPdf = computed(() => {
  return cnt.value >= 7;
})
/**
* 시작~종료 기간을 년/개월로 계산
* @param {string} startDateStr - 시작일 (YYYY-MM)
* @param {string|null} endDateStr - 종료일 (YYYY-MM) | null이면 재직중
* @returns {{years:number, months:number, text:string}}
*/
function calcPeriodYearsMonths(startDateStr, endDateStr = null) {
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  // 일 기준 보정
  if (days < 0) {
    months -= 1;
  }

  // 개월 음수 보정
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // 음수 방어
  if (years < 0) {
    years = 0;
    months = 0;
  }

  const total = years > 0 ? `${years}년 ${months}개월` : `${months}개월`

  if (endDateStr) {
    return `${startDateStr} - ${endDateStr} (${total})`;
  } else {
    return `${startDateStr} - 재직중 (${total})`;
  }
}

function calcToTotalMonth(start, end = null) {
  const s = new Date(`${start}-01`);
  const e = end ? new Date(`${end}-01`) : new Date();

  return (
    (e.getFullYear() - s.getFullYear()) * 12 +
    (e.getMonth() - s.getMonth())
  )
}

function formatPeriod(start, end = null) {
  const totalMonth = calcPeriodYearsMonths(start, end);
  const years = Math.floor(totalMonth / 12);
  const months = (totalMonth & 12);

  const ym = years > 0 ? `${years}년 ${months}개월` : `${months}개월`
  const endDate = end ? end : '재직중';

  return `${start} - ${endDate} (${ym})`;
}

const experiencesComputed = computed(() =>
  resume.experiences.map(exp => ({
    ...exp,
    periodText: formatPeriod(exp.start, exp.end),
    totalMonths: calcToTotalMonth(exp.start, exp.end),
    projects: exp.projects?.map(p => ({
      ...p,
      periodText: formatPeriod(p.start, p.end),
      totalMonths: calcToTotalMonth(p.start, p.end),
    }))
  }))
)

const headlinePeriod = computed(() => {
  const totalMonths = experiencesComputed.value.reduce(
    (sum, e) => sum + e.totalMonths,
    0
  )

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  const period = (months == 0 ? `${years}년` : `${years}년 ${months}개월`) + '+';

  return `FullStack Developer · ${period}`;
})
/**
 * ✅ 여기(resume 객체)만 수정하면 화면 내용이 바뀝니다.
 * - contacts: label은 화면 표시 텍스트, href는 링크(선택)
 * - experiences/projects: 항목 추가/삭제는 배열에서 하면 됩니다.
 */
const resume = {
  profile: {
    name: '서상훈',
    headline: 'FullStack Developer · 3년 5개월+',
    contacts: [
      { label: '010-5112-7717', href: 'tel:01051127717'},
      { label: 'seosh9369@gmail.com', href: 'mailto:seosh9369@gmail.com', prefix: '@' },
      { label: 'Seoul, KR' },
    ],
    summary: [
      '저는 서비스의 실제 운영 환경에서 발생하는 문제를 기술로 해결하는 개발자입니다.',
      '웹·모바일 서비스 개발부터 보안 솔루션 운영, 대기업 내부망 환경에서의 서비스 구축까지 경험하였습니다.',
      '기능 구현을 넘어 안정성과 확장성을 고려한 개발의 중요성을 체득해 왔습니다.'
    ],
  },

  experiences: [
    {
      company: 'AITStory',
      position: '풀스택 개발자',
      start: '2024-05',
      end: null,
      description: '사내 ERP 개발 및 SI 파견 근무',
      highlights: [
        '사내 ERP 관련 소스 코드 개발',
        '기존 Vue2 → Vue3 마이그레이션',
        'Spring Boot 2.7.4 → 3.1.3 마이그레이션'
      ],
      projects: [
        {
          name: '삼성카드 모니모 원앱 데이터서비스포털 웹페이지 메인 개발',
          period: calcPeriodYearsMonths('2024-09', '2025-12'),
          bullets: [
            '삼성카드 모니모 원앱 데이터서비스포털 웹페이지 메인 개발',
            '권한/로그/배치 운영 도구 개발로 운영 효율 개선',
            '프런트/백엔드 전반 개발 및 유지보수',
            '타 개발자 소스코드 리뷰 및 검수',
          ],
          stack: 'Vue3, TypeScript, Oracle, Redis, K8S, Spring Boot, Docker, Git',
        },
        // {
        //   name: '검색/SEO 개선',
        //   period: '2022.03 – 2023.06',
        //   bullets: [
        //     'SSR 도입 및 메타/스키마 마크업 적용',
        //     '검색 노출 지표 개선 및 크롤링 오류 대응',
        //   ],
        //   stack: 'Vue3, TypeScript, Node.js, Google Search Console',
        // },
      ],
    },
    {
      company: 'LG하이케어솔루션',
      position: '정보보안 솔루션 운영',
      start: '2023-12',
      end: '2024-02',
      highlights: [
        '사내 정보보안 솔루션 운영 및 정책 관리',
        '보안 로그 분석 및 이슈 대응',
      ],
      projects: [
        {
          name: '사내 정보보안 규칙 수립',
          period: calcPeriodYearsMonths('2023-12', '2024-02'),
          bullets: ['개인정보 보호', '소만사 DLP 솔루션 관리', '문서중앙화 시스템 관리'],
          stack: 'DLP API, 문서 중앙화',
        },
      ],
    },
    {
      company: 'Epikar.corp',
      position: '풀스택 개발자',
      start: '2022-06',
      end: '2023-09',
      highlights: [
        '웹페이지 제작 및 어플리케이션 마이그레이션'
      ],
      projects: [
        {
          name: 'BTS(BMW Testdriving Service) / MTS(MINI Testdriving Service)',
          period: calcPeriodYearsMonths('2022-08', '2023-09'),
          bullets: [
            'BTS/MTS 딜러사 관리 웹페이지 제작',
            'BTS/MTS 딜러사 관리 어플리케이션 제작',
            '통계 관리 대시보드 제공'
          ],
          stack: 'Vue2, JavaScript, MySQL, Spring Boot, Jenkins, Docker',
        },
      ],
    },
  ],

  education: [
    {
      school: '인하공업전문대학교',
      major: '정보통신학과',
      period: '2014.03 – 2017.02',
      note: '전문학사',
    },
  ],

  skills: ['React', 'Vue3', 'Node.js', 'TypeScript', 'Sass', 'MySQL', 'Redis', 'K8S', 'Spring Boot', 'Docker', 'Git'],

  certificates: [
    { name: '정보처리산업기사', meta: '한국산업인력공단 · 2025' },
    { name: '워드프로세서3급', meta: '대한상공회의소 · 2007' },
    { name: 'ITQ 아래한글 A등급', meta: '한국생산성본부 · 2006' },
    { name: 'ITQ 한글파워포인트', meta: '한국생산성본부 · 2006' },
  ],

  languages: [
    { name: '일어', meta: 'JLPT 2級 · 2019' },
  ],

  bootcamp: [
    { name: '코리아 IT 아카데미', meta: 'AI활용 소프트웨어 개발 및 응용 · (2021.11 - 2022.04)' },
  ],
}
</script>

<style>
:root {
  --bg: #f5f6f8;
  --paper: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --line: #e5e7eb;
  --accent: #ff6a3d;
  --tag: #f3f4f6;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Noto Sans KR', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.55;
}

a {
  color: inherit;
}

.page {
  max-width: 900px;
  margin: 28px auto;
  padding: 0 16px;
}

.paper {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: 34px 34px 28px;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.name {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
}

.headline {
  margin: 0 0 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: #374151;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: var(--muted);
  font-size: 12.5px;
}

.meta-item {
  text-decoration: none;
}

.meta-item:hover {
  text-decoration: underline;
}

.divider {
  border: none;
  border-top: 1px solid var(--line);
  margin: 18px 0 22px;
}

.section {
  margin-top: 20px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.summary {
  margin-top: 14px;
}

.item {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 10px 14px;
  padding: 10px 0;
}

.item--compact {
  padding: 6px 0;
}

.icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--accent);
  display: grid;
  place-items: center;
  margin-top: 2px;
}

.icon--dark {
  background: #111827;
}

.icon svg {
  width: 12px;
  height: 12px;
  fill: #fff;
}

.item-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 10px;
  margin: 0 0 6px;
}

.org {
  font-weight: 700;
  font-size: 13.5px;
}

.role {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.period {
  font-size: 12px;
  color: var(--muted);
}

.desc {
  margin: 0;
  color: #374151;
  font-size: 13px;
}

.bullets {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #374151;
  font-size: 13px;
}

.bullets li {
  margin: 4px 0;
}

.projects {
  margin-top: 10px;
  border-left: 2px solid var(--line);
  padding-left: 12px;
}

.project {
  padding: 10px 0;
}

.project-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: baseline;
}

.project-name {
  font-weight: 700;
  font-size: 13px;
}

.project-period {
  font-size: 12px;
  color: var(--muted);
}

.stack {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--muted);
}

.stack b {
  color: #374151;
  font-weight: 600;
}

.bottom {
  margin-top: 18px;
  border-top: 1px solid var(--line);
  padding-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 22px;
}

.mini h3 {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: var(--tag);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12.5px;
  color: #374151;
}

.link-list,
.plain-list {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #374151;
  font-size: 13px;
}

.link-list li,
.plain-list li {
  padding: 4px 0;
}

.link-list a {
  text-decoration: none;
}

.link-list a:hover {
  text-decoration: underline;
}

.plain-title {
  font-weight: 600;
}

.plain-meta {
  color: var(--muted);
  font-size: 12px;
  margin-left: 8px;
}

@media (max-width: 720px) {
  .paper {
    padding: 22px 18px 18px;
  }

  .bottom {
    grid-template-columns: 1fr;
  }
}

@media print {
  body {
    background: #fff;
  }

  .page {
    margin: 0;
    padding: 0;
  }

  .paper {
    border: none;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }
}

.pdf-btn {
  border: 1px solid var(--line);
  background: #fff;
  color: #374151;
  font-size: 12.5px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pdf-btn:hover {
  background: #f9fafb;
}
</style>
