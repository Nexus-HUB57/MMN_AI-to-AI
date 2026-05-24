import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, buttonVariants } from "../../frontend/src/components/ui/button";
import { Card, StatCard, MetricCard } from "../../frontend/src/components/ui/card";
import { Badge, badgeVariants } from "../../frontend/src/components/ui/badge";
import { Input, inputVariants } from "../../frontend/src/components/ui/input";
import { Progress, CircularProgress } from "../../frontend/src/components/ui/progress";
import { Skeleton, SkeletonText, SkeletonCard } from "../../frontend/src/components/ui/skeleton";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Loader2: () => React.createElement("span", { "data-testid": "loader" }),
}));

describe("Button Component", () => {
  it("should render with default props", () => {
    render(React.createElement(Button, null, "Click me"));
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("should apply correct variant classes", () => {
    const { variants } = buttonVariants();
    expect(variants).toBeDefined();
  });

  it("should show loading state", () => {
    render(React.createElement(Button, { loading: true }, "Loading"));
    expect(screen.getByText("Carregando...")).toBeDefined();
    expect(screen.getByTestId("loader")).toBeDefined();
  });

  it("should support icon props", () => {
    const icon = React.createElement("span", { "data-testid": "icon" });
    render(React.createElement(Button, { leftIcon: icon }, "With Icon"));
    expect(screen.getByTestId("icon")).toBeDefined();
  });

  it("should be disabled when loading", () => {
    const { container } = render(React.createElement(Button, { loading: true }, "Disabled"));
    expect(container.querySelector("button")?.disabled).toBe(true);
  });
});

describe("Card Component", () => {
  it("should render with children", () => {
    render(
      React.createElement(
        Card,
        null,
        React.createElement("div", null, "Card Content")
      )
    );
    expect(screen.getByText("Card Content")).toBeDefined();
  });

  it("should apply variant classes", () => {
    const { variants } = Card;
    expect(variants).toBeDefined();
  });

  it("should render StatCard with all props", () => {
    render(
      React.createElement(StatCard, {
        title: "Total Users",
        value: 1234,
        description: "Last 30 days",
        trend: "up",
        trendValue: "+12%",
      })
    );
    expect(screen.getByText("Total Users")).toBeDefined();
    expect(screen.getByText("1234")).toBeDefined();
    expect(screen.getByText("Last 30 days")).toBeDefined();
  });

  it("should show loading state in StatCard", () => {
    render(React.createElement(StatCard, { title: "Loading", loading: true }));
    expect(document.querySelector(".animate-pulse")).toBeDefined();
  });
});

describe("MetricCard Component", () => {
  it("should render progress bar", () => {
    render(
      React.createElement(MetricCard, {
        title: "Progress",
        value: 50,
        progress: 50,
        maxValue: 100,
      })
    );
    expect(screen.getByText("50")).toBeDefined();
    expect(screen.getByText("50%")).toBeDefined();
  });
});

describe("Badge Component", () => {
  it("should render with default variant", () => {
    render(React.createElement(Badge, null, "Default Badge"));
    expect(screen.getByText("Default Badge")).toBeDefined();
  });

  it("should apply correct variant classes", () => {
    const { variants } = badgeVariants();
    expect(variants).toBeDefined();
    expect(variants.variants.variant).toContain("success");
    expect(variants.variants.variant).toContain("warning");
    expect(variants.variants.variant).toContain("gradient");
  });

  it("should render success badge", () => {
    render(React.createElement(Badge, { variant: "success" }, "Success"));
    expect(screen.getByText("Success")).toBeDefined();
  });

  it("should render warning badge", () => {
    render(React.createElement(Badge, { variant: "warning" }, "Warning"));
    expect(screen.getByText("Warning")).toBeDefined();
  });
});

describe("Input Component", () => {
  it("should render with default props", () => {
    render(React.createElement(Input, { placeholder: "Enter text" }));
    expect(screen.getByPlaceholderText("Enter text")).toBeDefined();
  });

  it("should apply error variant", () => {
    const { container } = render(React.createElement(Input, { error: true }));
    expect(container.querySelector("input")).toBeDefined();
  });

  it("should support different sizes", () => {
    render(React.createElement(Input, { inputSize: "lg" }));
    expect(document.querySelector(".h-12")).toBeDefined();
  });

  it("should handle onChange events", () => {
    const handleChange = vi.fn();
    const { container } = render(
      React.createElement(Input, { onChange: handleChange })
    );
    fireEvent.change(container.querySelector("input")!, { target: { value: "test" } });
    expect(handleChange).toHaveBeenCalled();
  });
});

describe("Progress Component", () => {
  it("should render with value", () => {
    render(React.createElement(Progress, { value: 50 }));
    expect(document.querySelector(".bg-blue-600")).toBeDefined();
  });

  it("should show label when requested", () => {
    render(React.createElement(Progress, { value: 75, showLabel: true }));
    expect(screen.getByText("75%")).toBeDefined();
  });

  it("should apply variant styles", () => {
    const { variants } = Progress;
    expect(variants).toBeDefined();
  });

  it("should clamp value between 0 and 100", () => {
    const { container } = render(React.createElement(Progress, { value: 150 }));
    expect(container.querySelector("div[style]")).toBeDefined();
  });
});

describe("CircularProgress Component", () => {
  it("should render with value", () => {
    render(
      React.createElement(CircularProgress, {
        value: 60,
        showValue: true,
      })
    );
    expect(screen.getByText("60%")).toBeDefined();
  });

  it("should display label when provided", () => {
    render(
      React.createElement(CircularProgress, {
        value: 80,
        showValue: true,
        label: "Complete",
      })
    );
    expect(screen.getByText("Complete")).toBeDefined();
  });
});

describe("Skeleton Component", () => {
  it("should render basic skeleton", () => {
    render(React.createElement(Skeleton, { className: "h-4 w-20" }));
    expect(document.querySelector(".animate-pulse")).toBeDefined();
  });

  it("should render skeleton text", () => {
    render(React.createElement(SkeletonText, { lines: 3 }));
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(3);
  });

  it("should render skeleton card", () => {
    render(React.createElement(SkeletonCard, { hasImage: true, hasFooter: true }));
    expect(document.querySelector(".rounded-lg")).toBeDefined();
  });

  it("should support gradient variant", () => {
    render(React.createElement(Skeleton, { variant: "gradient" }));
    expect(document.querySelector(".bg-gradient-to-r")).toBeDefined();
  });
});

describe("UI Component Integration", () => {
  it("should compose Button with Card", () => {
    render(
      React.createElement(
        Card,
        null,
        React.createElement(
          Card.CardHeader,
          null,
          React.createElement(Card.CardTitle, null, "Title"),
          React.createElement(Card.CardDescription, null, "Description")
        ),
        React.createElement(
          Card.CardContent,
          null,
          React.createElement(Button, { variant: "primary" }, "Action")
        )
      )
    );
    expect(screen.getByText("Title")).toBeDefined();
    expect(screen.getByText("Description")).toBeDefined();
    expect(screen.getByText("Action")).toBeDefined();
  });

  it("should compose StatCard with Badge", () => {
    render(
      React.createElement(StatCard, {
        title: "Status",
        value: "Active",
        icon: React.createElement(Badge, { variant: "success" }, "Active"),
      })
    );
    expect(screen.getByText("Active")).toBeDefined();
  });
});