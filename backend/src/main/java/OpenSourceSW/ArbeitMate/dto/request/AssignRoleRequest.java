package OpenSourceSW.ArbeitMate.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AssignRoleRequest {
    @NotNull private UUID roleId;
}
