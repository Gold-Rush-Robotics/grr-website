# About/goals

This is the public website for 49er Robotics (previously Gold Rush Robotics), UNC Charlotte's robotics club. Our club also as of summer 2026 mereged with multiple other robotics clubs (Vex, IGVC), hence the name change. It covers club info plus a small admin area for allowlisted members (Google sign-in) for management.

# Code stuff

## This is a basic t3 stack app. There are a few basic principles here to keep in mind:

- UI elements are primarily built on shadcn/ui. If there is a shadcn component for this you should not try to make your own. If you need to add a new component use the pnpm dlx command in the shadcn docs for it.
- The code for shadcn components (anything in the /components/ui folder) is not to be edited directly unless there is a VERY good reason for it. Other parts in the code rely on this and we don't want to stray from original shadcn code if we need to update the components. If in the rare case where there is no workaround and edits are directly made they should be documented in the file.
- The /components folder is only for components installed such as from shadcn or tiptap. Anything custom belongs in `/src/app/_components`, or if it's only going to ever be used in a specific route `/src/app/<route>/_components`.
- Because we are using shadcn, 90% of the point is to make styling consistent and not have the code cluttered with tailwind classes. Prefer existing components and their built-in APIs (`variant`, `size`, `as`, etc.). The classes used should be limited to layout except for places where the design of something isn't in the scope of a normal shadcn component. If components genuinely need to be constantly styled with a bunch of parameters, this should be considered as a new component with these styles, or modifying the existing ones.

```tsx
// Prefer
<Typography variant="h1">Career Fair</Typography>
<Button variant="outline">Register</Button>

// Avoid
<h1 className="font-heading text-4xl tracking-tight sm:text-5xl">Career Fair</h1>
<Typography className="font-heading text-4xl text-muted-foreground">Career Fair</Typography>
<Button className="rounded-full border px-4">Register</Button>
```

- Keep changes limited to the user's intent, and try to not propose drastic complex code changes when it can be done much simpler. This doesn't mean sacrifice everything for purely optimizing lines of code; the point here is that we strongly prefer to do things right and cut down on technical debt. If that means more code that is perfectly fine; however from practice for day to day tasks it usually does not.
- Do not make db migrations unless everything that is happening in the current PR is finished. Usually if the user asks to make a change it is only a part of the whole feature they are working on, so if you make a migration you are adding unnecessary bloat because there will be other changes later.
- Same thing goes as above when it comes to creating commits.

## Additionally when running/testing code:

- Do not spin up a dev server or try to make a new build. The user will almost certainly already have one running. If you try to make a build it will completely mess up the running dev server because they both output to .next folder so do not do that if one is running.
- Do not self run custom commands when there is a pnpm command defined in the `package.json`. This should always be preferred because there is sometimes things specific to the project in there that will be missed if you don't use the pnpm command.

# Other

If you run into something that was either misleading in this file that misguided you, let the user know why you were lead that way from this file so it can be fixed in the future.
