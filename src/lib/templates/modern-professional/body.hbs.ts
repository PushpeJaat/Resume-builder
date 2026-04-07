export const modernProfessionalBody = `
<div class="resume-root">
  <aside class="resume-sidebar">
    <h1 class="brand">{{personal.fullName}}</h1>
    <p class="role-line">Professional profile</p>
    <div class="side-block">
      <p class="side-title">Contact</p>
      {{#if personal.email}}<p class="side-text">{{personal.email}}</p>{{/if}}
      {{#if personal.phone}}<p class="side-text" style="margin-top:2mm">{{personal.phone}}</p>{{/if}}
      {{#if personal.location}}<p class="side-text" style="margin-top:2mm">{{personal.location}}</p>{{/if}}
    </div>
    {{#if personal.hasLinks}}
    <div class="side-block">
      <p class="side-title">Links</p>
      <ul class="side-links">
        {{#each personal.links}}
        <li><a href="{{url}}">{{label}}</a></li>
        {{/each}}
      </ul>
    </div>
    {{/if}}
  </aside>
  <main class="resume-main">
    {{#if hasSummary}}
    <section>
      <h2 class="section-title">Summary</h2>
      <p class="summary">{{summary}}</p>
    </section>
    {{/if}}
    {{#if hasExperience}}
    <section>
      <h2 class="section-title">Experience</h2>
      {{#each experience}}
      <article class="job">
        <div class="job-head">
          <div>
            <h3 class="job-title">{{role}}</h3>
            <p class="job-company">{{company}}</p>
          </div>
          <span class="job-dates">{{start}} — {{end}}</span>
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
    {{#if hasEducation}}
    <section>
      <h2 class="section-title">Education</h2>
      {{#each education}}
      <div class="edu">
        <p class="edu-school">{{school}}</p>
        <p class="edu-degree">{{degree}}</p>
        <p class="edu-dates">{{start}} — {{end}}</p>
      </div>
      {{/each}}
    </section>
    {{/if}}
    {{#if hasSkills}}
    <section>
      <h2 class="section-title">Skills</h2>
      <div class="skills-grid">
        {{#each skills}}
        {{#if hasItems}}
        <div class="skill-cat">
          <p class="skill-cat-name">{{category}}</p>
          <div class="skill-pills">
            {{#each items}}
            {{#if this}}<span class="skill-pill">{{this}}</span>{{/if}}
            {{/each}}
          </div>
        </div>
        {{/if}}
        {{/each}}
      </div>
    </section>
    {{/if}}
  </main>
</div>
`;
