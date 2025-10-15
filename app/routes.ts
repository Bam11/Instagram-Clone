import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";


export default [
  route("/login", "routes/login.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/complete-profile", "routes/complete-profile.tsx"),
  // Protected Routes
  layout("routes/layout.tsx", [index("routes/home.tsx")]),
] satisfies RouteConfig;
