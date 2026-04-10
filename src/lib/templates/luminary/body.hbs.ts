export const luminaryBody = `
<div class="resume-root">

  <!-- ═══════════════════════════════════ HEADER ═══════════════════════════════════ -->
  <header class="header">

    <!-- Left: name + meta -->
    <div class="header-text">
      <p class="header-label">Résumé</p>
      <h1 class="header-name">{{personal.fullName}}</h1>
      {{#if hasSummary}}
      <p class="header-summary">{{summary}}</p>
      {{/if}}
      <div class="header-contact">
        {{#if personal.email}}<span class="contact-item">{{personal.email}}</span>{{/if}}
        {{#if personal.phone}}<span class="contact-item">{{personal.phone}}</span>{{/if}}
        {{#if personal.location}}<span class="contact-item">{{personal.location}}</span>{{/if}}
        {{#if personal.hasLinks}}
          {{#each personal.links}}
          <a class="contact-link" href="{{url}}">{{label}}</a>
          {{/each}}
        {{/if}}
      </div>
    </div>

    <!-- Right: photo -->
    <div class="header-photo-wrap">
      {{#if personal.hasPhoto}}
      <img class="header-photo" src="{{personal.photoUrl}}" alt="Profile photo for {{personal.fullName}}" />
      {{else}}
      <div class="header-photo-fallback">{{personal.initials}}</div>
      {{/if}}
      <div class="photo-ring"></div>
    </div>

  </header>

  <!-- gold rule -->
  <div class="gold-rule"></div>

  <!-- ═══════════════════════════════════ BODY ════════════════════════════════════ -->
  <div class="body-grid">

    <!-- ─────── LEFT COLUMN ─────── -->
    <div class="col-left">

      {{#if hasExperience}}
      <section class="section">
        <h2 class="section-heading">Experience</h2>
        {{#each experience}}
        <article class="job">
          <div class="job-header">
            <div class="job-meta">
              <h3 class="job-role">{{role}}</h3>
              <p class="job-company">{{company}}</p>
            </div>
            <span class="job-period">{{start}}{{#if end}} – {{end}}{{/if}}</span>
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
        <h2 class="section-heading">Education</h2>
        {{#each education}}
        <article class="edu">
          <div class="edu-header">
            <div>
              <p class="edu-school">{{school}}</p>
              <p class="edu-degree">{{degree}}</p>
            </div>
            <span class="edu-period">{{start}}{{#if end}} – {{end}}{{/if}}</span>
          </div>
        </article>
        {{/each}}
      </section>
      {{/if}}

    </div>

    <!-- ─────── RIGHT COLUMN ─────── -->
    <div class="col-right">

      {{#if hasSkills}}
      <section class="section">
        <h2 class="section-heading">Skills</h2>
        {{#each skills}}
        {{#if hasItems}}
        <div class="skill-group">
          <p class="skill-category">{{category}}</p>
          <div class="skill-chips">
            {{#each items}}
            {{#if this}}<span class="chip">{{this}}</span>{{/if}}
            {{/each}}
          </div>
        </div>
        {{/if}}
        {{/each}}
      </section>
      {{/if}}

    </div>

  </div><!-- /body-grid -->

</div><!-- /resume-root -->
`;
