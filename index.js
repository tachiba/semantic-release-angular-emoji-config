const typeSpecs = [
  {
    type: "✨",
    string: "Features"
  },
  {
    type: "🐛",
    string: "Bug fixes"
  },
  {
    type: "📒",
    string: "Documentation"
  },
  {
    type: "👕",
    string: "Styles"
  },
  {
    type: "♻️",
    string: "Refactoring"
  },
  {
    type: "🚀",
    string: "Performance Improvements"
  },
  {
    type: "💚",
    string: "Tests"
  },
  {
    type: "⚙️",
    string: "Chores"
  },
  {
    type: "🚮",
    string: "Deprecations"
  },
  {
    type: "Revert",
    string: "Reverts"
  }
];

// https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser
const parserOpts = {
  headerPattern: /^(.*?)(?:\((.*)\))?:?\s(.*)$/,
  referenceActions: typeSpecs.map(({ type }) => type),
  revertPattern: /^Revert\s"([\s\S]*)"\s*This reverts commit (\w*)\./
};

// https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/writer-opts.js
// https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-atom/writer-opts.js
const writerOpts = {
  transform: commit => {
    const { type } = commit;

    // Rewrite types
    const typeSpecIndex = typeSpecs.findIndex(({ type: t }) => type === t);
    if (typeSpecIndex === -1) return;
    const typeSpec = typeSpecs[typeSpecIndex];
    if (typeSpec.type.length <= 2) {
      commit.type = `${typeSpec.type} ${typeSpec.string}`;
    } else {
      commit.type = typeSpec.string;
    }

    // Sort by index
    commit.typeSpecIndex = typeSpecIndex;

    // Prefer shorter hash
    if (typeof commit.hash === "string") {
      commit.hash = commit.hash.substring(0, 7);
    }

    return commit;
  },
  commitGroupsSort: "typeSpecIndex"
};

module.exports = {
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        // https://github.com/semantic-release/commit-analyzer#releaserules
        // https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js
        releaseRules: [
          { breaking: true, release: "major" },
          { revert: true, release: "patch" },
          { type: "✨", release: "minor" },
          { type: "🐛", release: "patch" },
          { type: "🚀", release: "patch" }
        ],
        parserOpts
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        parserOpts,
        writerOpts
      }
    ],
    [
      "@semantic-release/github",
      {
        successComment: false,
        failComment: false,
        labels: false
      }
    ]
  ]
};
