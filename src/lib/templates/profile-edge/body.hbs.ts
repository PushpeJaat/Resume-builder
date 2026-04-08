export const profileEdgeBody = `
<div class="resume-root">
  <aside class="sidebar">
    <div class="photo-wrap">
      {{#if personal.hasPhoto}}
      <img class="photo" src="{{personal.photoUrl}}" alt="Profile photo for {{personal.fullName}}" />
      {{else}}
      <div class="photo-fallback">{{personal.initials}}</div>
      {{/if}}
    </div>
    <h1 class="name">{{personal.fullName}}</h1>
    <p class="sidebar-kicker">Profile</p>

    <section class="side-block">
      <h2 class="side-title">Contact</h2>
      {{#if personal.email}}<p class="side-line">{{personal.email}}</p>{{/if}}
      {{#if personal.phone}}<p class="side-line">{{personal.phone}}</p>{{/if}}
      {{#if personal.location}}<p class="side-line">{{personal.location}}</p>{{/if}}
    </section>

    {{#if personal.hasLinks}}
    <section class="side-block">
      <h2 class="side-title">Links</h2>
      <ul class="side-links">
        {{#each personal.links}}
        <li><a href="{{url}}">{{label}}</a></li>
        {{/each}}
      </ul>
    </section>
    {{/if}}

    {{#if hasSkills}}
    <section class="side-block">
      <h2 class="side-title">Skills</h2>
      {{#each skills}}
      {{#if hasItems}}
      <div class="side-skill-group">
        <p class="side-skill-name">{{category}}</p>
        <p class="side-skill-items">{{itemsJoined}}</p>
      </div>
      {{/if}}
      {{/each}}
    </section>
    {{/if}}
  </aside>

  <main class="main">
    {{#if hasSummary}}
    <section class="section intro-card">
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

    {{#if hasEducation}}
    <section class="section">
      <h2 class="section-title">Education</h2>
      {{#each education}}
      <article class="edu">
        <h3 class="edu-school">{{school}}</h3>
        <p class="edu-degree">{{degree}}</p>
        <p class="edu-dates">{{start}} - {{end}}</p>
      </article>
      {{/each}}
    </section>
    {{/if}}
  </main>
</div>
`;
