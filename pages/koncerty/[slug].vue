<script setup>
const route = useRoute();
const { concerts } = useConcerts();

// Extract ID from the slug parameter (format: "id-title-slug")
const getId = (slug) => {
  const match = slug.match(/^(\d+)/);
  return match ? parseInt(match[1]) : null;
};

// Find concert by ID extracted from slug
const concert = computed(() => {
  const id = getId(route.params.slug);
  return concerts.value.find((c) => c.id === id);
});
</script>