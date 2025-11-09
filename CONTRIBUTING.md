# Contributing to E-commerce Platform

Welcome to our E-commerce Platform project! We appreciate your interest in contributing. This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

### Our Pledge
We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites
Before contributing, ensure you have:
- **Java 17** or higher
- **Node.js 18** or higher
- **npm 9** or higher
- **MySQL 8.0** or higher
- **Git** for version control

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/DEA-FINAL-PROJECT-24.2-.git
   cd DEA-FINAL-PROJECT-24.2-
   ```

2. **Set up Backend**
   ```bash
   cd Ecommerce-Backend
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

3. **Set up Frontend**
   ```bash
   cd Ecommerce-Frontend
   npm install
   npm run dev
   ```

4. **Database Setup**
   - Create MySQL database: `ecommerce_db`
   - Update `application.properties` with your database credentials
   - Run the application to auto-generate tables

## Development Workflow

### Branch Naming Convention
- **Feature branches**: `feature/feature-name`
- **Bug fixes**: `bugfix/issue-description`
- **Hotfixes**: `hotfix/critical-fix`
- **Documentation**: `docs/documentation-update`

### Workflow Steps
1. **Create a new branch** from `main` or `mainfeatures`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly

4. **Commit your changes** with descriptive messages
   ```bash
   git add .
   git commit -m "feat: add user profile management functionality"
   ```

5. **Push to your fork** and create a Pull Request

## Code Style Guidelines

### Backend (Java/Spring Boot)
- **Naming Conventions**:
  - Classes: `PascalCase` (e.g., `ProductController`)
  - Methods: `camelCase` (e.g., `getUserById`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
  - Packages: `lowercase` (e.g., `com.ecommerce.service`)

- **Code Structure**:
  ```java
  @RestController
  @RequestMapping("/api/products")
  public class ProductController {
      
      private final ProductService productService;
      
      public ProductController(ProductService productService) {
          this.productService = productService;
      }
      
      @GetMapping("/{id}")
      public ResponseEntity<Product> getProduct(@PathVariable Long id) {
          // Implementation
      }
  }
  ```

- **Best Practices**:
  - Use dependency injection
  - Implement proper exception handling
  - Add comprehensive JavaDoc comments
  - Follow SOLID principles
  - Use DTOs for API responses

### Frontend (React/JavaScript)
- **Naming Conventions**:
  - Components: `PascalCase` (e.g., `ProductCard.jsx`)
  - Functions: `camelCase` (e.g., `fetchProducts`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
  - CSS classes: `kebab-case` (e.g., `product-card`)

- **Component Structure**:
  ```javascript
  import React, { useState, useEffect } from 'react';
  import './ProductCard.css';
  
  const ProductCard = ({ product, onAddToCart }) => {
      const [isLoading, setIsLoading] = useState(false);
      
      // Component logic
      
      return (
          <div className="product-card">
              {/* JSX content */}
          </div>
      );
  };
  
  export default ProductCard;
  ```

- **Best Practices**:
  - Use functional components with hooks
  - Implement proper prop validation
  - Use meaningful component and variable names
  - Organize imports: React imports first, then third-party, then local
  - Use Context API for global state management

### General Guidelines
- **Indentation**: Use 4 spaces for Java, 2 spaces for JavaScript/JSX
- **Line Length**: Maximum 120 characters
- **Comments**: Write clear, concise comments for complex logic
- **Documentation**: Update relevant documentation for new features

## Testing

### Backend Testing
- **Unit Tests**: Use JUnit 5 and Mockito
- **Integration Tests**: Test API endpoints
- **Test Coverage**: Aim for minimum 80% coverage

Example test structure:
```java
@SpringBootTest
class ProductServiceTest {
    
    @MockBean
    private ProductRepository productRepository;
    
    @Autowired
    private ProductService productService;
    
    @Test
    void shouldReturnProductWhenFound() {
        // Given
        Product product = new Product("Test Product", 100.0);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        
        // When
        Product result = productService.findById(1L);
        
        // Then
        assertThat(result.getName()).isEqualTo("Test Product");
    }
}
```

### Frontend Testing
- **Component Tests**: Use React Testing Library
- **Unit Tests**: Test utility functions
- **E2E Tests**: Use Cypress for critical user flows

## Submitting Changes

### Pull Request Process
1. **Update documentation** if needed
2. **Ensure tests pass** and add new tests for new functionality
3. **Update the README.md** if you change functionality
4. **Create detailed PR description**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Screenshots
   (If applicable)
   ```

### Commit Message Guidelines
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```bash
feat: add product search functionality
fix: resolve cart total calculation issue
docs: update API documentation for user endpoints
```

## Issue Reporting

### Before Creating an Issue
1. **Search existing issues** to avoid duplicates
2. **Check the documentation** for solutions
3. **Test with the latest version**

### Issue Template
```markdown
**Bug Report / Feature Request**

**Description**
Clear description of the issue or feature

**Steps to Reproduce** (for bugs)
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior** (for bugs)
What actually happens

**Environment**
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Version: [Application version]

**Screenshots**
If applicable, add screenshots
```

## Feature Requests

### Guidelines for Feature Requests
1. **Check existing issues** for similar requests
2. **Provide detailed description** of the feature
3. **Explain the use case** and benefits
4. **Consider implementation complexity**
5. **Be open to discussion** and feedback

### Feature Request Template
```markdown
**Feature Request**

**Summary**
Brief summary of the feature

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
Detailed description of the proposed feature

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other context, mockups, or examples
```

## Development Environment Tips

### Useful Commands
```bash
# Backend
./mvnw clean test                 # Run tests
./mvnw clean package             # Build JAR
./mvnw spring-boot:run           # Run application

# Frontend
npm run dev                      # Development server
npm run build                    # Build for production
npm run test                     # Run tests
npm run lint                     # Code linting
```

### IDE Setup
- **IntelliJ IDEA** recommended for backend development
- **VS Code** recommended for frontend development
- Install relevant plugins for code formatting and linting

## Getting Help

### Communication Channels
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Reviews**: Through pull request comments

### Team Members
- **Pruthivi Thejan** - Full Stack Developer
- **Ravi Ranasinghe** - Full Stack Developer
- **Pasindu Madusanka** - Full Stack Developer

## Recognition

We appreciate all contributions, no matter how small. Contributors will be recognized in our:
- **Contributors section** in README.md
- **Release notes** for significant contributions
- **Special mentions** in documentation

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to our E-commerce Platform! Your efforts help make this project better for everyone.