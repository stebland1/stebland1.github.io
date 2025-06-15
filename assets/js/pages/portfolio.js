async function fetchProjects() {
  try {
    // @TODO: pull from github repo readme
    const res = await fetch("api/portfolio-projects.json");

    if (!res.ok) {
      throw new Error(res.status.toString());
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export { fetchProjects };
