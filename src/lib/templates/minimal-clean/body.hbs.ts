export const minimalCleanBody = `
<div class="resume-root">
  <header class="header">
    <h1 class="name">{{personal.fullName}}</h1>
    <div class="meta-row">
      {{#if personal.email}}<span class="meta-item">{{personal.email}}</span>{{/if}}
      {{#if personal.phone}}<span class="meta-item">{{personal.phone}}</span>{{/if}}
      {{#if personal.location}}<span class="meta-item">{{personal.location}}</span>{{/if}}
    </div>
    {{#if personal.hasLinks}}
    <div class="links">
      {{#each personal.links}}
      <a href="{{url}}">{{label}}</a>
      {{/each}}
    </div>
    {{/if}}
  </header>
  {{#if hasSummary}}
  <section class="section">
    <h2 class="section-title">Summary</h2>
    <p class="summary">{{summary}}</p>
  </section>
  {{/if}}
  {{#if hasExperience}}
  <section class="section">
    <h2 class="section-title">Experience</h2>
    {{#each experience}}
    <article class="job">
      <div class="job-top">
        <div>
          <h3 class="job-role">{{role}}</h3>
          <p class="job-co">{{company}}</p>
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
  <section class="section">
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
  <section class="section">
    <h2 class="section-title">Skills</h2>
    <div class="skills">
      {{#each skills}}
      {{#if hasItems}}
      <div class="skill-row">
        <p class="skill-cat">{{category}}</p>
        <p class="skill-items">{{itemsJoined}}</p>
      </div>
      {{/if}}
      {{/each}}
    </div>
  </section>
  {{/if}}
</div>
`;
