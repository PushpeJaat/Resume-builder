export const novaNoirBody = `
<div class="nn-root">
  <header class="nn-header">
    <div class="nn-header-overlay"></div>
    <div class="nn-header-content">
      <div>
        <p class="nn-kicker">Portfolio Resume</p>
        <h1 class="nn-name">{{personal.fullName}}</h1>
      </div>
      <div class="nn-contact">
        {{#if personal.email}}<span>{{personal.email}}</span>{{/if}}
        {{#if personal.phone}}<span>{{personal.phone}}</span>{{/if}}
        {{#if personal.location}}<span>{{personal.location}}</span>{{/if}}
      </div>
      {{#if hasSummary}}
      <p class="nn-summary">{{summary}}</p>
      {{/if}}
    </div>

    <div class="nn-avatar-wrap">
      {{#if personal.hasPhoto}}
      <img class="nn-avatar" src="{{personal.photoUrl}}" alt="Profile photo for {{personal.fullName}}" />
      {{else}}
      <div class="nn-avatar-fallback">{{personal.initials}}</div>
      {{/if}}
    </div>
  </header>

  <main class="nn-main">
    <section class="nn-column nn-column-left">
      {{#if hasExperience}}
      <section class="nn-section">
        <h2 class="nn-title">Experience</h2>
        {{#each experience}}
        <article class="nn-entry">
          <div class="nn-entry-head">
            <h3 class="nn-role">{{role}}</h3>
            <p class="nn-time">{{start}}{{#if end}} - {{end}}{{/if}}</p>
          </div>
          <p class="nn-company">{{company}}</p>
          {{#if hasBullets}}
          <ul class="nn-points">
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
      <section class="nn-section">
        <h2 class="nn-title">Education</h2>
        {{#each education}}
        <article class="nn-entry nn-edu">
          <div class="nn-entry-head">
            <h3 class="nn-role">{{degree}}</h3>
            <p class="nn-time">{{start}}{{#if end}} - {{end}}{{/if}}</p>
          </div>
          <p class="nn-company">{{school}}</p>
        </article>
        {{/each}}
      </section>
      {{/if}}
    </section>

    <aside class="nn-column nn-column-right">
      {{#if personal.hasLinks}}
      <section class="nn-side-block">
        <h2 class="nn-side-title">Links</h2>
        <ul class="nn-links">
          {{#each personal.links}}
          <li><a href="{{url}}">{{label}}</a></li>
          {{/each}}
        </ul>
      </section>
      {{/if}}

      {{#if hasSkills}}
      <section class="nn-side-block">
        <h2 class="nn-side-title">Skills</h2>
        {{#each skills}}
        {{#if hasItems}}
        <div class="nn-skill-group">
          <p class="nn-skill-label">{{category}}</p>
          <p class="nn-skill-line">{{itemsJoined}}</p>
        </div>
        {{/if}}
        {{/each}}
      </section>
      {{/if}}
    </aside>
  </main>
</div>
`;