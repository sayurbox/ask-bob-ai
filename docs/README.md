# 📚 Bob AI CLI Documentation

Complete documentation for Bob AI CLI Extension, organized by audience and purpose.

---

## 📖 Documentation Structure

```
docs/
├── 📘 user-guide/          → For end users of the extension
├── 🛠️ dev/                 → For developers testing/contributing
├── 🏗️ technical/           → Architecture & API reference
└── README.md              → This file
```

---

## 📘 User Guide

Documentation for **end users** who want to customize and use Bob AI CLI.

| File | Description | Audience |
|------|-------------|----------|
| [CUSTOMIZING_TEMPLATES.md](./user-guide/CUSTOMIZING_TEMPLATES.md) | How to customize Quick Action prompts using the Visual Editor | 👤 End Users |
| [WORKING_WITH_IMAGES.md](./user-guide/WORKING_WITH_IMAGES.md) | How to send images to Claude Code for visual context analysis | 👤 End Users |

**Start here if you want to:**
- ✏️ Edit Quick Action prompts
- ➕ Create custom templates
- 🔄 Reset templates to defaults
- 📁 Understand `.askbob/` folder structure
- 🖼️ Send images to Claude Code for visual context

---

## 🛠️ Developer Guide

Documentation for **developers** working on the extension or testing features.

| File | Description | Audience |
|------|-------------|----------|
| [TESTING_TEMPLATES.md](./dev/TESTING_TEMPLATES.md) | Complete testing guide for template editing feature (17 test cases) | 👨‍💻 Developers |

**Start here if you want to:**
- 🧪 Test the template editing feature
- 🐛 Debug template loading issues
- ✅ Run through the testing checklist
- 🔍 Verify feature implementation

---

## 🏗️ Technical Documentation

**Architecture, design decisions, and API references** for developers.

| File | Description | Audience |
|------|-------------|----------|
| [TEMPLATE_ARCHITECTURE.md](./technical/TEMPLATE_ARCHITECTURE.md) | Technical architecture, data flow, design patterns | 🏗️ Architects/Core Devs |
| [TEMPLATE_API.md](./technical/TEMPLATE_API.md) | API reference, function signatures, TypeScript interfaces | 🏗️ Core Developers |
| [IMAGE_ATTACHMENT_PLAN.md](./technical/IMAGE_ATTACHMENT_PLAN.md) | Complete image feature implementation plan (3 phases) | 🏗️ Core Developers |
| [PHASE2_CLIPBOARD_PREVIEW.md](./technical/PHASE2_CLIPBOARD_PREVIEW.md) | Phase 2: Clipboard image preview implementation details | 🏗️ Core Developers |

**Start here if you want to:**
- 🏗️ Understand the system architecture
- 🔧 Contribute to core template system
- 📐 Learn design patterns used (copy-on-write, etc.)
- 🔌 Integrate with template loader API

---

## 🚀 Quick Navigation

### I want to...

**🎯 Customize my Quick Actions**
→ Read [user-guide/CUSTOMIZING_TEMPLATES.md](./user-guide/CUSTOMIZING_TEMPLATES.md)

**🖼️ Work with images in Claude Code**
→ Read [user-guide/WORKING_WITH_IMAGES.md](./user-guide/WORKING_WITH_IMAGES.md)

**🧪 Test the template system**
→ Read [dev/TESTING_TEMPLATES.md](./dev/TESTING_TEMPLATES.md)

**🏗️ Understand how it works**
→ Read [technical/TEMPLATE_ARCHITECTURE.md](./technical/TEMPLATE_ARCHITECTURE.md)

**🔧 Build on top of the API**
→ Read [technical/TEMPLATE_API.md](./technical/TEMPLATE_API.md)

---

## 📊 Document Types Legend

| Icon | Type | Audience | Purpose |
|------|------|----------|---------|
| 📘 | User Guide | End Users | How-to guides, tutorials |
| 🛠️ | Dev Guide | Contributors | Testing, debugging, workflows |
| 🏗️ | Technical | Architects | Architecture, API, design |

---

## 🗂️ File Naming Convention

- **User Guides:** `CUSTOMIZING_*.md` - Action-oriented names
- **Dev Guides:** `TESTING_*.md` - Process-oriented names
- **Technical:** `*_ARCHITECTURE.md`, `*_API.md` - System-oriented names

---

## 📝 Contributing to Docs

When adding new documentation:

1. **Choose the right folder:**
   - `user-guide/` - End-user how-to guides
   - `dev/` - Developer workflows and testing
   - `technical/` - Architecture and API docs

2. **Follow naming conventions:**
   - User: `CUSTOMIZING_FEATURE.md`
   - Dev: `TESTING_FEATURE.md`
   - Technical: `FEATURE_ARCHITECTURE.md` or `FEATURE_API.md`

3. **Update this README:**
   - Add entry to appropriate section
   - Update quick navigation if needed

4. **Link from main README:**
   - Add reference in main README.md if user-facing

---

## 🔗 Related Documentation

- **Main README:** [../README.md](../README.md) - Project overview and quick start
- **Testing Guide:** [../TESTING.md](../TESTING.md) - Extension testing guide
- **Demo Guide:** [../DEMO_CAPTURE_GUIDE.md](../DEMO_CAPTURE_GUIDE.md) - How to create demos
- **Project Instructions:** [../CLAUDE.md](../CLAUDE.md) - Development guidance

---

## 📚 Full Documentation Index

### Template System
- 📘 **User:** [Customizing Templates](./user-guide/CUSTOMIZING_TEMPLATES.md)
- 🛠️ **Dev:** [Testing Templates](./dev/TESTING_TEMPLATES.md)
- 🏗️ **Technical:** [Architecture](./technical/TEMPLATE_ARCHITECTURE.md) • [API](./technical/TEMPLATE_API.md)

### Image Features
- 📘 **User:** [Working with Images](./user-guide/WORKING_WITH_IMAGES.md)
- 🏗️ **Technical:** [Image Implementation Plan](./technical/IMAGE_ATTACHMENT_PLAN.md)

### Extension Features
- 📘 **User:** See [Main README](../README.md#-quick-start)
- 🛠️ **Dev:** See [TESTING.md](../TESTING.md)

### Contributing
- 🛠️ **Dev:** See [CLAUDE.md](../CLAUDE.md)

---

## 📦 Document Status

| Document | Status | Last Updated | Version |
|----------|--------|--------------|---------|
| CUSTOMIZING_TEMPLATES.md | ✅ Complete | Oct 2024 | 1.0 |
| WORKING_WITH_IMAGES.md | ✅ Complete | Nov 2024 | 1.0 |
| TESTING_TEMPLATES.md | ✅ Complete | Oct 2024 | 1.0 |
| TEMPLATE_ARCHITECTURE.md | ✅ Complete | Oct 2024 | 1.0 |
| TEMPLATE_API.md | ✅ Complete | Oct 2024 | 1.0 |
| IMAGE_ATTACHMENT_PLAN.md | ✅ Complete | Nov 2024 | 1.0 |

---

## 🆘 Need Help?

- **Using the extension?** → Check [user-guide/](./user-guide/)
- **Testing issues?** → Check [dev/TESTING_TEMPLATES.md](./dev/TESTING_TEMPLATES.md)
- **Technical questions?** → Check [technical/](./technical/)
- **Still stuck?** → [Open an issue](https://github.com/sayurbox/ask-bob-ai/issues)

---

**Made with ❤️ for developers who love documentation**
