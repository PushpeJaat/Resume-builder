export const executivePortraitBody = `
<div class="resume-root">
  <header class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Executive resume</p>
      <h1 class="name">{{personal.fullName}}</h1>
      {{#if hasSummary}}
      <p class="summary-intro">{{summary}}</p>
      {{/if}}
      <div class="contact-row">
        {{#if personal.email}}<span>{{personal.email}}</span>{{/if}}
        {{#if personal.phone}}<span>{{personal.phone}}</span>{{/if}}
        {{#if personal.location}}<span>{{personal.location}}</span>{{/if}}
      </div>
      {{#if personal.hasLinks}}
      <div class="links-row">
        {{#each personal.links}}
        <a href="{{url}}">{{label}}</a>
        {{/each}}
      </div>
      {{/if}}
    </div>
    <div class="photo-shell">
      {{#if personal.hasPhoto}}
      <img class="photo" src="{{personal.photoUrl}}" alt="Profile photo for {{personal.fullName}}" />
      {{else}}
      <div class="photo-fallback">{{personal.initials}}</div>
      {{/if}}
    </div>
  </header>

  {{#if hasExperience}}
  <section class="section">
    <h2 class="section-title">Experience</h2>
    {{#each experience}}
    <article class="job">
      <div class="job-top">
        <div class="job-title-wrap">
          <h3 class="job-role">{{role}}</h3>
          <p class="job-company">{{company}}</p>
        </div>
        <span class="job-dates">{{start}} - {{end}}</span>
      </div>
      {{#if hasBullets}}
      <ul class="bullets">
        {{#each bullets}}
        {{#if this}}<li>{{this}}</li>{{/if}}
        {{/each}}
      </ul>
      {{/if}}
    </article>
    {{/each}}
  </section>
  {{/if}}

  <div class="lower-grid">
    {{#if hasEducation}}
    <section class="section">
      <h2 class="section-title">Education</h2>
      {{#each education}}
      <article class="edu">
        <p class="edu-school">{{school}}</p>
        <p class="edu-degree">{{degree}}</p>
        <p class="edu-dates">{{start}} - {{end}}</p>
      </article>
      {{/each}}
    </section>
    {{/if}}

    {{#if hasSkills}}
    <section class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills-grid">
        {{#each skills}}
        {{#if hasItems}}
        <article class="skill-card">
          <p class="skill-name">{{category}}</p>
          <div class="skill-pills">
            {{#each items}}
            {{#if this}}<span class="skill-pill">{{this}}</span>{{/if}}
            {{/each}}
          </div>
        </article>
        {{/if}}
        {{/each}}
      </div>
    </section>
    {{/if}}
  </div>
</div>
`;
