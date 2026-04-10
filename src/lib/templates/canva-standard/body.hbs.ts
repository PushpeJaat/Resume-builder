export const canvaStandardBody = `
<div class="resume-root">
  <aside class="resume-sidebar">
    <div class="identity-block">
      {{#if personal.hasPhoto}}
      <img class="profile-photo" src="{{personal.photoUrl}}" alt="Profile photo for {{personal.fullName}}" />
      {{else}}
      <div class="profile-fallback">{{personal.initials}}</div>
      {{/if}}

      <h1 class="resume-name">{{personal.fullName}}</h1>
      <p class="resume-role">Professional Resume</p>
    </div>

    <section class="sidebar-block">
      <h2 class="sidebar-title">Contact</h2>
      {{#if personal.email}}<p class="sidebar-line">{{personal.email}}</p>{{/if}}
      {{#if personal.phone}}<p class="sidebar-line">{{personal.phone}}</p>{{/if}}
      {{#if personal.location}}<p class="sidebar-line">{{personal.location}}</p>{{/if}}
    </section>

    {{#if personal.hasLinks}}
    <section class="sidebar-block">
      <h2 class="sidebar-title">Links</h2>
      <ul class="sidebar-links">
        {{#each personal.links}}
        <li><a href="{{url}}">{{label}}</a></li>
        {{/each}}
      </ul>
    </section>
    {{/if}}

    {{#if hasSkills}}
    <section class="sidebar-block">
      <h2 class="sidebar-title">Skills</h2>
      {{#each skills}}
      {{#if hasItems}}
      <div class="skill-group">
        <p class="skill-group-name">{{category}}</p>
        <div class="skill-pills">
          {{#each items}}
          {{#if this}}<span class="skill-pill">{{this}}</span>{{/if}}
          {{/each}}
        </div>
      </div>
      {{/if}}
      {{/each}}
    </section>
    {{/if}}
  </aside>

  <main class="resume-main">
    {{#if hasSummary}}
    <section class="content-card summary-card">
      <h2 class="section-title">Profile</h2>
      <p class="summary">{{summary}}</p>
    </section>
    {{/if}}

    {{#if hasExperience}}
    <section class="content-card">
      <h2 class="section-title">Experience</h2>
      {{#each experience}}
      <article class="entry-block job-block">
        <div class="entry-head">
          <div>
            <h3 class="entry-title">{{role}}</h3>
            <p class="entry-subtitle">{{company}}</p>
          </div>
          <p class="entry-date">{{start}} - {{end}}</p>
        </div>
        {{#if hasBullets}}
        <ul class="entry-bullets">
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
    <section class="content-card">
      <h2 class="section-title">Education</h2>
      {{#each education}}
      <article class="entry-block education-block">
        <div class="entry-head">
          <div>
            <h3 class="entry-title">{{school}}</h3>
            <p class="entry-subtitle">{{degree}}</p>
          </div>
          <p class="entry-date">{{start}} - {{end}}</p>
        </div>
      </article>
      {{/each}}
    </section>
    {{/if}}
  </main>
</div>
`;