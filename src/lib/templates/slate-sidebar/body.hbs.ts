export const slateSidebarBody = `
<div class="resume">

  <!-- LEFT SIDEBAR -->
  <div class="sidebar">

    {{#if personal.hasPhoto}}
      <img src="{{personal.photo}}" class="profile-img" />
    {{/if}}

    <h1>{{personal.fullName}}</h1>
    <p class="role">Professional</p>

    <div class="contact">
      {{#if personal.email}}<p>{{personal.email}}</p>{{/if}}
      {{#if personal.phone}}<p>{{personal.phone}}</p>{{/if}}
      {{#if personal.location}}<p>{{personal.location}}</p>{{/if}}
    </div>

    {{#if personal.hasLinks}}
    <div class="section">
      <h3>Links</h3>
      {{#each personal.links}}
        <p><a href="{{url}}" target="_blank">{{label}}</a></p>
      {{/each}}
    </div>
    {{/if}}

    {{#if hasSkills}}
    <div class="section">
      <h3>Skills</h3>
      {{#each skills}}
        <p class="skill-category">{{category}}</p>
        {{#if hasItems}}
          <ul>
            {{#each items}}
              {{#if this}}<li>{{this}}</li>{{/if}}
            {{/each}}
          </ul>
        {{/if}}
      {{/each}}
    </div>
    {{/if}}

  </div>

  <!-- RIGHT CONTENT -->
  <div class="main">

    {{#if hasSummary}}
    <div class="section">
      <h2>Profile</h2>
      <p>{{summary}}</p>
    </div>
    {{/if}}

    {{#if hasExperience}}
    <div class="section">
      <h2>Experience</h2>
      {{#each experience}}
      <div class="item">
        <h3>{{role}}</h3>
        <p class="sub">{{company}} | {{start}} &ndash; {{end}}</p>
        {{#if hasBullets}}
        <ul>
          {{#each bullets}}
            {{#if this}}<li>{{this}}</li>{{/if}}
          {{/each}}
        </ul>
        {{/if}}
      </div>
      {{/each}}
    </div>
    {{/if}}

    {{#if hasEducation}}
    <div class="section">
      <h2>Education</h2>
      {{#each education}}
      <div class="item">
        <h3>{{degree}}</h3>
        <p class="sub">{{school}} | {{start}} &ndash; {{end}}</p>
      </div>
      {{/each}}
    </div>
    {{/if}}

  </div>

</div>
`;
