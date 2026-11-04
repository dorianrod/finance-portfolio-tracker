export const BAR_CORNERS = {
  flat: [0, 0, 0, 0],
  top: [3, 3, 0, 0],
  bottom: [0, 0, 3, 3],
  right: [0, 3, 3, 0],
  wideRight: [0, 4, 4, 0],
  rounded: 3,
} satisfies Record<string, number | [number, number, number, number]>
