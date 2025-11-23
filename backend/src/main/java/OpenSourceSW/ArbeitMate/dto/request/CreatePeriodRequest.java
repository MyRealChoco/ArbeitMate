package OpenSourceSW.ArbeitMate.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CreatePeriodRequest {
    private String name;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    @NotNull private LocalDateTime availabilityDueAt;
}
