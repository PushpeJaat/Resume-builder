export const sunriseStrataBody = `
<div class="ss-root">
  <div class="ss-glow ss-glow-one"></div>
  <div class="ss-glow ss-glow-two"></div>
  <div class="ss-gridline ss-gridline-one"></div>
  <div class="ss-gridline ss-gridline-two"></div>

  <header class="ss-header">
    <div class="ss-head-main">
      <p class="ss-kicker">Career Profile</p>
      <h1 class="ss-name">{{personal.fullName}}</h1>
      {{#if hasSummary}}
      <p class="ss-summary">{{summary}}</p>
      {{/if}}
      <div class="ss-meta">
        {{#if personal.email}}<span>{{personal.email}}</span>{{/if}}
        {{#if personal.phone}}<span>{{personal.phone}}</span>{{/if}}
        {{#if personal.location}}<span>{{personal.location}}</span>{{/if}}
      </div>
    </div>

    <div class="ss-photo-wrap">
      {{#if personal.hasPhoto}}
      <img class="ss-photo" src="{{personal.photoUrl}}" alt="Profile photo for {{personal.fullName}}" />
      {{else}}
      <div class="ss-photo-fallback">{{personal.initials}}</div>
      {{/if}}
    </div>
  </header>

  <main class="ss-content-grid">
    <section class="ss-main-col">
      {{#if hasExperience}}
      <section class="ss-section">
        <h2 class="ss-section-title">Experience</h2>
        {{#each experience}}
        <article class="ss-card ss-job">
          <div class="ss-card-head">
            <div>
              <h3 class="ss-role">{{role}}</h3>
              <p class="ss-company">{{company}}</p>
            </div>
            <p class="ss-period">{{start}}{{#if end}} - {{end}}{{/if}}</p>
          </div>
          {{#if hasBullets}}
          <ul class="ss-bullets">
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
      <section class="ss-section">
        <h2 class="ss-section-title">Education</h2>
        {{#each education}}
        <article class="ss-card ss-edu">
          <div class="ss-card-head">
            <div>
              <h3 class="ss-role">{{degree}}</h3>
              <p class="ss-company">{{school}}</p>
            </div>
            <p class="ss-period">{{start}}{{#if end}} - {{end}}{{/if}}</p>
          </div>
        </article>
        {{/each}}
      </section>
      {{/if}}
    </section>

    <aside class="ss-side-col">
      <section class="ss-panel">
        <h2 class="ss-panel-title">Contact</h2>
        {{#if personal.email}}<p class="ss-line">{{personal.email}}</p>{{/if}}
        {{#if personal.phone}}<p class="ss-line">{{personal.phone}}</p>{{/if}}
        {{#if personal.location}}<p class="ss-line">{{personal.location}}</p>{{/if}}
      </section>

      {{#if personal.hasLinks}}
      <section class="ss-panel">
        <h2 class="ss-panel-title">Links</h2>
        <ul class="ss-links">
          {{#each personal.links}}
          <li><a href="{{url}}">{{label}}</a></li>
          {{/each}}
        </ul>
      </section>
      {{/if}}

      {{#if hasSkills}}
      <section class="ss-panel">
        <h2 class="ss-panel-title">Skills</h2>
        {{#each skills}}
        {{#if hasItems}}
        <div class="ss-skill-group">
          <p class="ss-skill-category">{{category}}</p>
          <div class="ss-chip-wrap">
            {{#each items}}
            {{#if this}}<span class="ss-chip">{{this}}</span>{{/if}}
            {{/each}}
          </div>
        </div>
        {{/if}}
        {{/each}}
      </section>
      {{/if}}
    </aside>
  </main>
</div>
`;