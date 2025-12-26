<template>
  <div class="page page--split" ref="resumeRef">
    <aside class="side">
      <div class="side__photo">
        <img src="../public/photo.jpg" alt="프로필 사진" />
      </div>
      <div class="side__box">
        <h2 class="side__title">개인정보</h2>
        <ul class="side__list">
          <li v-for="(c, idx) in resume.profile.contacts" :key="idx">
            <a v-if="c.href" :href="c.href" class="side__link" target="_blank" rel="noreferrer">
              {{ c.label }}
            </a>
            <span v-else>{{ c.label }}</span>
          </li>
        </ul>
      </div>
      <div v-if="resume.certificates?.length" class="side__box">
        <h2 class="side__title">자격증</h2>
        <ul class="side__list">
          <li v-for="(c, i) in resume.certificates" :key="i">
            <div class="side__row">
              <span>{{ c.name }}</span>
              <small class="side__muted">{{ c.meta }}</small>
            </div>
          </li>
        </ul>
      </div>
      <div v-if="resume.skills?.length" class="side__box">
        <h2 class="side__title">기술 숙련도</h2>
        <div class="skills-badges">
          <span v-for="(s, i) in sortedSkillList" :key="i" class="skill-badge">
            {{ s.name }}
          </span>
        </div>
      </div>
    </aside>

    <main class="paper paper--content" aria-label="이력서">
      <header class="header">
        <div>
          <p class="eyebrow">서비스 전체 흐름을 이해하고 구현하는</p>
          <h1 class="name" @click="cnt++">
            <span class="name__highlight">{{ resume.profile.name }}</span> <span class="name__suffix">입니다.</span>
          </h1>
          <p class="headline">{{ headlinePeriod }}</p>
        </div>

        <div class="header-actions">
          <button v-if="showPdf && !pdfState" class="pdf-btn" @click="downloadPdf">
            PDF 다운로드
          </button>
        </div>
      </header>

      <section v-if="resume.profile.summary?.length" class="summary" id="summary">
        <h2 class="section-title">소개</h2>
        <ul class="bullets">
          <li v-for="(line, i) in resume.profile.summary" :key="i">{{ line }}</li>
        </ul>
      </section>

      <section v-if="resume.experiences?.length" class="section" id="experiences">
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
              <div class="project-head">
                <span class="org">{{ exp.company }}</span>
                <span v-if="exp.position" class="role">{{ exp.position }}</span>
                <span class="period">{{ calcPeriodYearsMonths(exp.start, exp.end) }}</span>
              </div>
            </div>

            <p v-if="exp.description" class="desc">{{ exp.description }}</p>

            <ul v-if="exp.highlights?.length" class="bullets">
              <li v-for="(b, bi) in exp.highlights" :key="bi">{{ b }}</li>
            </ul>

            <div v-if="exp.projects?.length" class="projects">
              <div class="project-label">[진행 프로젝트]</div>
              <v-expansion-panels multiple
                :model-value="pdfState ? exp.projects.map((_, idx) => idx) : (projectPanels[i] || [])"
                @update:modelValue="val => projectPanels[i] = val" class="project-panels">
                <v-expansion-panel v-for="(p, pi) in exp.projects" :key="pi" :value="pi" class="project-panel">
                  <v-expansion-panel-title>
                    <div class="project-title">
                      <span class="project-name">{{ p.name }}</span>
                      <span v-if="p.period" class="project-period">{{ p.period }}</span>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="project-meta">
                      <span>수행인원: {{ p.teamSize }}</span>
                      <span v-if="p.involvement">참여도: {{ p.involvement }}</span>
                    </div>
                    <ul v-if="p.bullets?.length" class="bullets bullets--tight">
                      <li v-for="(pb, pbi) in p.bullets" :key="pbi">{{ pb }}</li>
                    </ul>
                    <p v-if="p.description" class="desc">{{ p.description }}</p>
                    <p v-if="p.stack" class="stack"><b>기술</b>: {{ p.stack }}</p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
        </article>
      </section>

      <section v-if="resume.education?.length" class="section" id="education">
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
              <span class="school">{{ edu.school }}</span>
              <span v-if="edu.major" class="major">{{ edu.major }}<span v-if="edu.grade">({{ edu.grade }})</span></span>
              <span class="period">{{ edu.period }}</span>
            </div>
            <!-- <p v-if="edu.note" class="desc">{{ edu.note }}</p> -->
          </div>
        </article>
      </section>

      <section v-if="resume.bootcamp?.length" class="section" id="bootcamp">
        <h2 class="section-title">교육</h2>
        <ul class="plain-list">
          <li v-for="(c, i) in resume.bootcamp" :key="i">
            <span class="plain-title">{{ c.name }}</span>
            <span class="plain-meta">{{ c.meta }}</span>
          </li>
        </ul>
      </section>

      <section v-if="resume.languages?.length" class="section" id="languages">
        <h2 class="section-title">외국어</h2>
        <ul class="plain-list">
          <li v-for="(l, i) in resume.languages" :key="i">
            <span class="plain-title">{{ l.name }}</span>
            <span class="plain-meta">{{ l.meta }}</span>
          </li>
        </ul>
      </section>

      <div class="fab-container" :class="{ 'fab-hidden': pdfState }" aria-label="빠른 이동">
        <button class="fab-btn fab-top" @click="scrollToTop" title="위로 가기">↑</button>
        <div class="fab-menu">
          <button class="fab-btn fab-plus" @click="toggleFabMenu" :aria-expanded="fabMenuOpen" title="섹션 이동">
            +
          </button>
          <div v-if="fabMenuOpen" class="fab-list">
            <button v-for="sec in navSections" :key="sec.id" class="fab-list-item" @click="scrollToSection(sec.id)">
              {{ sec.label }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue';
import html2pdf from 'html2pdf.js';

const resumeRef = ref(null);
const pdfState = ref(false);
const projectPanels = ref({});
const fabMenuOpen = ref(false);

async function downloadPdf() {
  const prevPanels = JSON.parse(JSON.stringify(projectPanels.value));
  const element = resumeRef.value;
  pdfState.value = true;
  await nextTick();

  const opt = {
    margin: [10, 10, 10, 10],
    filename: '서상훈_포트폴리오.pdf',
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

  await html2pdf().set(opt).from(element).save();
  pdfState.value = false;
  projectPanels.value = prevPanels;
  cnt.value = 0;
}

function toggleFabMenu() {
  fabMenuOpen.value = !fabMenuOpen.value;
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  fabMenuOpen.value = false;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fabMenuOpen.value = false;
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
    return `${startDateStr} ~ ${endDateStr} (${total})`;
  } else {
    return `${startDateStr} ~ 재직중 (${total})`;
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

  return `${start} ~ ${endDate} (${ym})`;
}

const experiencesComputed = computed(() =>
  resume.value.experiences.map(exp => ({
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

const navSections = computed(() => [
  { id: 'summary', label: '소개', enabled: resume.value.profile.summary?.length },
  { id: 'experiences', label: '경력', enabled: resume.value.experiences?.length },
  { id: 'education', label: '학력', enabled: resume.value.education?.length },
  { id: 'skills', label: '스킬', enabled: resume.value.skills?.length },
  { id: 'bootcamp', label: '교육', enabled: resume.value.bootcamp?.length },
  { id: 'certificates', label: '자격/수상', enabled: resume.value.certificates?.length },
  { id: 'languages', label: '외국어', enabled: resume.value.languages?.length },
].filter(s => s.enabled))

// function clampLevel(level) {
//   if (level === undefined || level === null || isNaN(level)) return 0;
//   return Math.min(100, Math.max(0, Number(level)));
// }

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
const resume = ref({
  profile: {
    name: '서상훈',
    headline: 'FullStack Developer · 3년 5개월+',
    contacts: [
      { label: '010-5112-7717', href: 'tel:01051127717' },
      { label: 'seosh9369@gmail.com', href: 'mailto:seosh9369@gmail.com', prefix: '@' },
      { label: 'Seoul, KR' },
    ],
    summary: [
      '요구사항 분석부터 구현·운영 대응까지 개발 전 과정을 경험하며 문제 해결 능력을 키워왔습니다.',
      '기획·디자인·운영 담당자와의 협업을 통해 기술과 비즈니스 사이의 균형을 맞추는 개발을 지향합니다.',
      '다양한 경험을 토대로 각 환경에서 안정적인 서비스 구조를 설계해 왔습니다.',
      '운영 이후까지 책임질 수 있는 구조를 만드는 것을 개발의 중요한 가치로 생각합니다.'
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
        '사내 ERP 관련 웹 페이지 제작',
        '전체 프로젝트 베이스 소스 코드 개발',
        'Vue2 → Vue3 마이그레이션 / Spring Boot 2.7.4 → 3.1.3 마이그레이션'
      ],
      projects: [
        {
          name: '삼성카드 모니모 원앱 데이터서비스포털 웹페이지 메인 개발',
          period: calcPeriodYearsMonths('2024-09', '2025-12'),
          teamSize: '8명',
          involvement: '기획·설계 50% / 개발 70%',
          bullets: [
            '삼성카드 모니모 원앱 내 데이터서비스포털의 메인 웹 페이지 설계 및 구현을 담당',
            '포털을 단일 진입점(Single Entry Point)으로 구성하여 삼성 내부 시스템과 외부 솔루션을 연결하는 중앙 인증 허브(Authentication Gateway) 구조 설계',
            '삼성 내부 인증 → 포털 인증 → 외부 솔루션 연계로 이어지는 다단계 인증 플로우를 정의하고 인증 책임을 단계별로 분리',
            '포털에서 검증된 사용자에 대해 세션/토큰 기반 인증 정보를 발급하여 솔루션 간 신뢰 연계 구조(SSO 유사 구조) 구현',
            'JWT와 Redis를 활용한 인증 정보 관리 및 로그인 세션 유지 전략 설계',
            'WebSocket 기반 암호화 사용자 정보 전달 방식을 적용하여 로그인 보안성 강화',
            '사용자 권한(Role/Policy)에 따라 접근 가능한 서비스·메뉴를 제어하는 권한 기반 접근 제어 체계 구현',
            '권한·로그·배치 관리 도구를 직접 개발하여 운영 대응 시간 및 관리 비용 절감',
            '프론트엔드(Vue3)부터 백엔드(Spring Boot)까지 전반적인 기능 개발 및 유지보수 담당',
            'PR 기반 코드 리뷰 문화 정착을 통해 코드 품질과 팀 생산성 향상에 기여'
          ],
          stack: 'Vue3, TypeScript, Oracle, Redis, K8S, Spring Boot, Docker, Git',
        }
      ],
    },
    {
      company: 'LG하이케어솔루션',
      position: '정보보안 솔루션 운영',
      start: '2023-12',
      end: '2024-02',
      description: '보안 솔루션 관리 및 지점 보안 관리',
      highlights: [
        '사내 보안 솔루션의 인증·접근 로그를 중앙에서 관리하여 보안 감사 및 이슈 추적 체계 구축',
        '정보보안 정책 수립 및 운영 가이드 정리를 통해 내부 보안 기준 정착에 기여',
        '보안 로그 분석을 통한 이상 징후 탐지 및 이슈 대응',
        '소만사 DLP 솔루션을 활용한 내부 정보 유출 방지 체계 운영',
        '문서중앙화 시스템 관리 및 사용자 권한 관리'
      ],
      projects: [],
    },
    {
      company: 'Epikar.corp',
      position: '풀스택 개발자',
      start: '2022-06',
      end: '2023-09',
      description: '고객사 웹·앱 유지보수 및 마이그레이션',
      highlights: [
        '기존 팀 리드가 구축한 사내 서비스의 구조를 분석하고 인수',
        'Vue 기반 화면 개발 및 기능 개선',
        'Spring Boot 기반 API 수정 및 신규 기능 개발',
        '모노레포를 통한 소스코드 공통화',
        '운영 중 발생하는 이슈 대응 및 추가 요구사항 반영',
        '요구사항을 기능 단위로 정리하여 티켓 기반으로 관리하며 Agile 방식으로 개발 진행'
      ],
      projects: [
        {
          name: 'BTS(BMW Testdriving Service) / MTS(MINI Testdriving Service)',
          period: calcPeriodYearsMonths('2022-08', '2023-09'),
          teamSize: '3명',
          involvement: '개발 45%',
          bullets: [
            '기존 팀 리드가 구축한 사내 서비스의 구조를 분석하고 신규 인력과 함께 인수·운영',
            '기존 코드 구조 및 데이터 흐름을 파악하여 기능 수정 및 확장에 필요한 기술 문서 정리',
            'Vue 기반 화면을 개선하고 사용자 요구사항을 반영한 신규 기능 개발',
            'Spring Boot 기반 API 수정 및 기능 추가를 통해 서비스 안정성 확보',
            '프론트엔드·백엔드 공통 모듈을 모노레포 형태로 관리하여 코드 중복 최소화',
            '운영 중 발생하는 이슈를 원인 분석 후 재발 방지 관점에서 개선',
            '요구사항을 기능 단위로 정리하여 티켓 기반으로 관리하며 Agile 방식으로 개발 진행'
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
      period: '2014-03 ~ 2017-02',
      grade: '4.09/4.5'
    },
    {
      school: '계양고등학교',
      major: '이과',
      period: '2011-03 ~ 2014-02'
    },
  ],

  skills: [
    { name: 'React', level: 70 },
    { name: 'Vue3', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'TypeScript', level: 83 },
    { name: 'MySQL', level: 85 },
    { name: 'Redis', level: 85 },
    { name: 'K8S', level: 70 },
    { name: 'Spring Boot', level: 85 },
    { name: 'Docker', level: 70 },
    { name: 'Git', level: 85 },
  ],

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
    { name: '코리아 IT 아카데미', meta: 'AI활용 소프트웨어 개발 및 응용 · (2021-11 ~ 2022-04)' },
  ],
})

const sortedSkillList = computed(() => {
  const defList = resume.value.skills;
  return defList.sort((a, b) => b.level - a.level);
})
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
  --org: #1f2937;
  --role: #2563eb;
  --role_ver2: #374151;
  --period: #9ca3af;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'SUIT', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.55;
}

a {
  color: inherit;
}

.page {
  max-width: 1000px;
  margin: 28px auto;
  padding: 0 16px;
}

.page--split {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  align-items: start;
}

.paper {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: 34px 34px 28px;
}

.paper--content {
  padding: 28px 28px 28px;
}

.side {
  background: #f7fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px 18px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.side__photo {
  display: grid;
  place-items: center;
}

.side__photo img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 20%;
  border: 4px solid #dceef5;
}

.side__box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.side__title {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.side__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #0f172a;
  font-size: 12.5px;
}

.side__link {
  color: inherit;
  text-decoration: none;
}

.side__link:hover {
  text-decoration: underline;
}

.side__row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.side__muted {
  color: #6b7280;
  font-size: 11.5px;
}

.skills-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-badge {
  display: inline-block;
  padding: 4px 10px;
  background: var(--tag);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
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

.name__highlight {
  color: #1f2937;
  font-weight: 800;
}

.name__suffix {
  font-size: 0.75em;
  font-weight: 500;
  color: #6b7280;
}

.headline {
  margin: 0 0 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: #374151;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  color: #2b768f;
  font-weight: 700;
  letter-spacing: -0.01em;
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
  color: var(--org);
}

.role {
  font-weight: 600;
  font-size: 13px;
  color: var(--role);
}

.period {
  font-size: 12px;
  color: var(--period);
}

.school {
  font-weight: 700;
  font-size: 13.5px;
  color: var(--org);
}

.major {
  font-weight: 600;
  font-size: 13px;
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
  line-height: 1.6;
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

.project-panels .v-expansion-panel-title {
  padding: 10px 12px;
}

.project-panels .v-expansion-panel-text__wrapper {
  padding: 8px 14px 14px;
}

.project-panel {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  color: #111827;
}

.project-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
}

.project-label {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.project-chip {
  margin-left: auto;
}

.project-meta {
  display: flex;
  gap: 10px;
  font-size: 12.5px;
  color: var(--muted);
  margin-bottom: 6px;
}

.bullets--tight {
  margin-top: 4px;
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

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skill-name {
  flex: 0 0 110px;
  font-size: 12.5px;
  font-weight: 600;
  color: #374151;
}

.skill-bar {
  flex: 1 1 auto;
  position: relative;
  height: 10px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.skill-bar__fill {
  height: 100%;
  background: #2b768f;
  border-radius: 999px;
  transition: width 0.2s ease;
}

.skill-level {
  min-width: 36px;
  text-align: right;
  font-size: 11.5px;
  color: #6b7280;
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

.fab-container {
  position: fixed;
  right: 18px;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 200;
}

.fab-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: #0f172a;
  color: #fff;
  font-size: 18px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.fab-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.22);
  background: #111827;
}

.fab-menu {
  position: relative;
}

.fab-list {
  position: absolute;
  bottom: 52px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
  border-radius: 10px;
  padding: 10px;
  min-width: 120px;
}

.fab-list-item {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12.5px;
  cursor: pointer;
  text-align: left;
  color: #0f172a;
}

.fab-list-item:hover {
  background: #e2e8f0;
}

.fab-top {
  background: #1e293b;
}

.fab-plus {
  background: #2b768f;
}

.fab-hidden {
  display: none;
}

@media print {
  .fab-container {
    display: none;
  }
}

@media (max-width: 720px) {
  .page {
    padding: 0 12px;
    margin: 16px auto;
  }

  .page--split {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .side {
    padding: 16px 14px;
    gap: 14px;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
    gap: 16px;
  }

  .side__photo {
    grid-column: 1;
    grid-row: 1 / -1;
  }

  .side__photo img {
    width: 100px;
    height: 100px;
    border-width: 3px;
  }

  .side__box {
    grid-column: 2;
  }

  .side__title {
    font-size: 12px;
  }

  .side__list {
    font-size: 11.5px;
    gap: 5px;
  }

  .side__muted {
    font-size: 10px;
  }

  .skills-badges {
    gap: 5px;
  }

  .skill-badge {
    font-size: 10.5px;
    padding: 3px 8px;
  }

  .paper {
    padding: 20px 16px;
  }

  .paper--content {
    padding: 20px 16px;
  }

  .name {
    font-size: 24px;
  }

  .headline {
    font-size: 13px;
  }

  .eyebrow {
    font-size: 11px;
  }

  .section-title {
    font-size: 13px;
  }

  .org,
  .school {
    font-size: 13px;
  }

  .role,
  .major {
    font-size: 12px;
  }

  .desc,
  .bullets {
    font-size: 12px;
  }

  .project-name {
    font-size: 12px;
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

img {
  max-width: 100%;
  height: auto;
}
</style>
