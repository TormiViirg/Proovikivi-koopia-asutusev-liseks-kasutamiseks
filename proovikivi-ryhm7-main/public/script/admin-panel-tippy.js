document.addEventListener('DOMContentLoaded', function () { 

  tippy('#genders', {
    content: `
      – “gender” tabelil on veerud (id, name).<br/>
      – Server lisab iga mitte-tühja rea uueks “name” kirje.<br/>
      – Kui soovid muuta või lisada rohkem valikuid, muuda või lisa siia ridu.
    `,
    allowHTML: true,
    animation: 'scale',
  });

  tippy('#userTypes', {
    content: `
      – “user_type” tabelil on AUTO_INCREMENT veerus “id”, seega vajame ainult “name” väärtust.<br/>
      – Lisa või eemalda ridu, et määrata, millised kasutajatüübid olemas on.
    `,
    allowHTML: true,
    animation: 'scale',
  });

  tippy('#schoolSubjects', {
    content: `
      – Iga mitte-tühi rida muutub üheks reaks tabelis \`school_subject(name)\`.<br/>
      – Tühje ridu jäta välja (need jäetakse vahele).
    `,
    allowHTML: true,
    animation: 'scale',
  });

  tippy('#globalGoals', {
    content: `
      – Kuna \`global_goal.image\` on BLOB ja ei või olla NULL, lisab backend vaikimisi tühja blob’i (\`\` '').<br/>
      – Iga rida siinses loendis muutub uueks \`title\` väärtuseks tabelis \`global_goal\`.
    `,
    allowHTML: true,
    animation: 'scale',
  });

  tippy('#proovikivid', {
    content: `
      – \`proovikivi\` tabelil on veerud \`(id, title, image, goal)\`.<br/>
      – Sisestame igast reast \`title\`; \`image\` muutub tühjaks BLOB-iks (\`\` ''), \`goal\` seatakse \`NULL\`.<br/>
      – Lisa või eemalda ridu, et hallata andmebaasi “projektidee” kirjeid.
    `,
    allowHTML: true,
    animation: 'scale',
  });

  tippy('#locations', {
    content: `
      – Iga mitte-tühi rida muutub üheks reaks tabelis \`location(name)\`.<br/>
      – Kohanda vastavalt vajadusele maakondade/linnade lisamiseks või eemaldamiseks.
    `,
    allowHTML: true,
    animation: 'scale',
  });

  tippy('#institutions', {
    content: `
      – Iga mitte-tühi rida muutub üheks reaks tabelis \`institution(name)\`.<br/>
      – Kohanda vastavalt vajadusele MTÜ-de või riigiasutuste lisamiseks või eemaldamiseks.
    `,
    allowHTML: true,
    animation: 'scale',
  });
});
