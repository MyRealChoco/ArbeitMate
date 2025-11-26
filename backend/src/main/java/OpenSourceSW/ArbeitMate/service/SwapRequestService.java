package OpenSourceSW.ArbeitMate.service;

import OpenSourceSW.ArbeitMate.domain.*;
import OpenSourceSW.ArbeitMate.domain.enums.SwapType;
import OpenSourceSW.ArbeitMate.dto.request.CreateSwapRequest;
import OpenSourceSW.ArbeitMate.dto.response.SwapRequestResponse;
import OpenSourceSW.ArbeitMate.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SwapRequestService {

    private final SwapRequestRepository swapRequestRepository;
    private final MemberRepository memberRepository;
    private final ScheduleAssignmentRepository scheduleAssignmentRepository;
    private final CompanyRepository companyRepository;

    /**
     * 1. 근무 교환/대타 요청 생성 (알바생)
     */
    @Transactional
    public UUID createRequest(UUID requesterId, UUID companyId, CreateSwapRequest req) {
        Member requester = memberRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("매장을 찾을 수 없습니다."));

        // 내 근무(From) 조회
        ScheduleAssignment fromAssignment = scheduleAssignmentRepository.findById(req.getFromAssignmentId())
                .orElseThrow(() -> new IllegalArgumentException("내 근무 정보를 찾을 수 없습니다."));

        // 유효성 검사: 내 근무가 맞는지
        if (!fromAssignment.getMember().getId().equals(requesterId)) {
            throw new IllegalArgumentException("본인의 근무만 교환 신청할 수 있습니다.");
        }

        // 대상 근무(To) 조회 (맞교환일 경우)
        ScheduleAssignment toAssignment = null;
        if (req.getType() == SwapType.DIRECT_SWAP) {
            if (req.getToAssignmentId() == null) {
                throw new IllegalArgumentException("맞교환 시 상대방의 근무 정보가 필요합니다.");
            }
            toAssignment = scheduleAssignmentRepository.findById(req.getToAssignmentId())
                    .orElseThrow(() -> new IllegalArgumentException("상대방 근무 정보를 찾을 수 없습니다."));
        }

        // 특정 대상 지정
        Member targetMember = null;
        if (req.getTargetMemberId() != null) {
            targetMember = memberRepository.findById(req.getTargetMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("대상 사용자를 찾을 수 없습니다."));
        }

        // 엔티티 생성
        SwapRequest swapRequest;
        if (req.getType() == SwapType.GIVE_AWAY) {
            if (targetMember == null) {
                swapRequest = SwapRequest.createGiveAwayOpen(company, fromAssignment, requester);
            } else {
                swapRequest = SwapRequest.createGiveAway(company, fromAssignment, requester, targetMember);
            }
        } else {
            // 맞교환 (무조건 특정 대상 필요)
            if (targetMember == null) {
                // 맞교환 대상이 명시 안됐으면, toAssignment의 주인으로 자동 설정
                targetMember = toAssignment.getMember();
            }
            swapRequest = SwapRequest.createDirectSwap(company, fromAssignment, toAssignment, requester, targetMember);
        }

        return swapRequestRepository.save(swapRequest).getId();
    }

    /**
     * 2. 요청 수락 (대상 알바생)
     */
    @Transactional
    public void acceptRequest(UUID memberId, UUID requestId) {
        Member accepter = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        SwapRequest request = swapRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("요청 정보를 찾을 수 없습니다."));

        // 도메인 로직 호출 (수락)
        request.accept(accepter);

        // 수락 즉시 '사장님 승인 대기' 상태로 변경
        request.requestOwnerApproval();
    }

    /**
     * 3. 최종 승인 (사장님) -> ★ 실제 스케줄 변경 발생 ★
     */
    @Transactional
    public void approveRequest(UUID ownerId, UUID requestId) {
        Member owner = memberRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        SwapRequest request = swapRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("요청 정보를 찾을 수 없습니다."));

        // 사장님 권한 체크 (간단히 Company Owner인지 확인)
        if (!request.getCompany().getOwner().getId().equals(ownerId)) {
            throw new IllegalArgumentException("해당 매장의 사장님만 승인할 수 있습니다.");
        }

        // 1) 요청 상태 승인으로 변경
        request.approve(owner);

        // 2) 실제 근무표(ScheduleAssignment) 업데이트
        updateScheduleAssignments(request);
    }

    /**
     * 실제 근무표 변경 로직 (승인 시 호출)
     */
    private void updateScheduleAssignments(SwapRequest request) {
        ScheduleAssignment from = request.getFromAssignment();
        Member requester = request.getCreatedBy();       // 원래 주인 (A)
        Member newWorker = request.getAcceptedMember();  // 새로 일할 사람 (B)

        if (request.getType() == SwapType.GIVE_AWAY) {
            // 대타: A의 근무 -> B에게 넘어감
            // (ScheduleAssignment 엔티티에 setMember 메소드가 있다고 가정)
            from.setMember(newWorker);
        } else if (request.getType() == SwapType.DIRECT_SWAP) {
            // 맞교환: A의 근무 <-> B의 근무 서로 바꿈
            ScheduleAssignment to = request.getToAssignment();

            // A의 근무에는 B를 넣고
            from.setMember(newWorker);
            // B의 근무에는 A를 넣음
            to.setMember(requester);
        }

    }

    /**
     * 4. 거절 (대상자 또는 사장님)
     */
    @Transactional
    public void declineRequest(UUID memberId, UUID requestId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        SwapRequest request = swapRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("요청 정보를 찾을 수 없습니다."));

        // 권한 체크는 생략(대상자거나 사장님이거나)
        request.decline(member);
    }

    /**
     * 조회: 알바생용 (내 관련 요청)
     */
    public List<SwapRequestResponse> getMyRequests(UUID memberId) {
        return swapRequestRepository.findAllMyRelatedRequests(memberId).stream()
                .map(SwapRequestResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * 조회: 사장님용 (매장 전체 요청)
     */
    public List<SwapRequestResponse> getCompanyRequests(UUID companyId) {
        return swapRequestRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(SwapRequestResponse::new)
                .collect(Collectors.toList());
    }
}