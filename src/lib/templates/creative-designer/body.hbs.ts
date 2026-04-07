export const creativeDesignerBody = `
<div class="resume-root">
  <div class="top-band"></div>
  <div class="inner">
    <div class="name-row">
      <div>
        <h1 class="name">{{personal.fullName}}</h1>
        <p class="tag">Creative professional</p>
      </div>
    </div>
    <div class="contact-strip">
      {{#if personal.email}}
      <div class="contact-cell">
        <p class="contact-label">Email</p>
        <p class="contact-value">{{personal.email}}</p>
      </div>
      {{/if}}
      {{#if personal.phone}}
      <div class="contact-cell">
        <p class="contact-label">Phone</p>
        <p class="contact-value">{{personal.phone}}</p>
      </div>
      {{/if}}
      {{#if personal.location}}
      <div class="contact-cell">
        <p class="contact-label">Location</p>
        <p class="contact-value">{{personal.location}}</p>
      </div>
      {{/if}}
    </div>
    {{#if personal.hasLinks}}
    <div class="links-row">
      {{#each personal.links}}
      <a href="{{url}}">{{label}}</a>
      {{/each}}
    </div>
    {{/if}}
    <div class="grid-2">
      <div>
        {{#if hasSummary}}
        <section style="margin-bottom:8mm">
          <h2 class="section-title">Profile</h2>
          <p class="summary">{{summary}}</p>
        </section>
        {{/if}}
        {{#if hasExperience}}
        <section>
          <h2 class="section-title">Experience</h2>
          {{#each experience}}
          <article class="job">
            <h3 class="job-role">{{role}}</h3>
            <p class="job-co">{{company}}</p>
            <p class="job-dates">{{start}} — {{end}}</p>
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
      </div>
      <div>
        {{#if hasEducation}}
        <section style="margin-bottom:8mm">
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
          {{#each skills}}
          {{#if hasItems}}
          <div class="skill-block">
            <p class="skill-cat">{{category}}</p>
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
    </div>
  </div>
</div>
`;
