export const auroraGlassBody = `
<div class="ag-root">
  <div class="ag-bg-orb ag-bg-orb-one"></div>
  <div class="ag-bg-orb ag-bg-orb-two"></div>

  <header class="ag-header">
    <div class="ag-header-main">
      <p class="ag-kicker">Creative Resume</p>
      <h1 class="ag-name">{{personal.fullName}}</h1>
      {{#if hasSummary}}
      <p class="ag-summary">{{summary}}</p>
      {{/if}}
      <div class="ag-contact-row">
        {{#if personal.email}}<span>{{personal.email}}</span>{{/if}}
        {{#if personal.phone}}<span>{{personal.phone}}</span>{{/if}}
        {{#if personal.location}}<span>{{personal.location}}</span>{{/if}}
      </div>
    </div>
    <div class="ag-photo-wrap">
      {{#if personal.hasPhoto}}
      <img class="ag-photo" src="{{personal.photoUrl}}" alt="Profile photo for {{personal.fullName}}" />
      {{else}}
      <div class="ag-photo-fallback">{{personal.initials}}</div>
      {{/if}}
    </div>
  </header>

  <main class="ag-grid">
    <section class="ag-main-col">
      {{#if hasExperience}}
      <section class="ag-section">
        <h2 class="ag-section-title">Experience</h2>
        {{#each experience}}
        <article class="ag-card">
          <div class="ag-card-head">
            <div>
              <h3 class="ag-role">{{role}}</h3>
              <p class="ag-company">{{company}}</p>
            </div>
            <p class="ag-period">{{start}}{{#if end}} - {{end}}{{/if}}</p>
          </div>
          {{#if hasBullets}}
          <ul class="ag-bullets">
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
      <section class="ag-section">
        <h2 class="ag-section-title">Education</h2>
        {{#each education}}
        <article class="ag-card ag-edu-card">
          <div class="ag-card-head">
            <div>
              <h3 class="ag-role">{{degree}}</h3>
              <p class="ag-company">{{school}}</p>
            </div>
            <p class="ag-period">{{start}}{{#if end}} - {{end}}{{/if}}</p>
          </div>
        </article>
        {{/each}}
      </section>
      {{/if}}
    </section>

    <aside class="ag-side-col">
      {{#if personal.hasLinks}}
      <section class="ag-side-block">
        <h2 class="ag-side-title">Links</h2>
        <ul class="ag-links">
          {{#each personal.links}}
          <li><a href="{{url}}">{{label}}</a></li>
          {{/each}}
        </ul>
      </section>
      {{/if}}

      {{#if hasSkills}}
      <section class="ag-side-block">
        <h2 class="ag-side-title">Skills</h2>
        {{#each skills}}
        {{#if hasItems}}
        <div class="ag-skill-group">
          <p class="ag-skill-category">{{category}}</p>
          <div class="ag-chip-wrap">
            {{#each items}}
            {{#if this}}<span class="ag-chip">{{this}}</span>{{/if}}
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