import numpy as np

def box_extractor(scores, geometry, min_confidence):
    (num_rows, num_cols) = scores.shape[2:4]
    rectangles = []
    confidences = []

    for y in range(0, num_rows):
        scores_data = scores[0, 0, y]
        x_data0 = geometry[0, 0, y]
        x_data1 = geometry[0, 1, y]
        x_data2 = geometry[0, 2, y]
        x_data3 = geometry[0, 3, y]
        angles_data = geometry[0, 4, y]

        for x in range(0, num_cols):
            if scores_data[x] < min_confidence:
                continue

            offset_x = x * 4.0
            offset_y = y * 4.0

            angle = angles_data[x]
            cos = np.cos(angle)
            sin = np.sin(angle)

            h = x_data0[x] + x_data2[x]
            w = x_data1[x] + x_data3[x]

            end_x = int(offset_x + (cos * x_data1[x]) + (sin * x_data2[x]))
            end_y = int(offset_y - (sin * x_data1[x]) + (cos * x_data2[x]))
            start_x = int(end_x - w)
            start_y = int(end_y - h)

            rectangles.append((start_x, start_y, end_x, end_y))
            confidences.append(scores_data[x])

    return (rectangles, confidences)
